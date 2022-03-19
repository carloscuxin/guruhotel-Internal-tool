import axios from 'axios';
import moment from 'moment';
// Own Libs
import { Room, PriceModel, Price, Metric, MetricModel } from '../entities';
import { Cache } from './Cache';
import { Period } from './Enum';


const DATE_FORMAT = 'YYYY/MM/DD';
const GET_DATE_FORMAT = 'DD/MM/YYYY';

const getDates = (period: Period) => {
  const date = moment().startOf('month');

  const period_dates = {
    [`p${Period.THIRTY_DAYS}`]: {
      start_date: moment(date),
      end_date: moment(date).endOf('month')
    }
  };

  switch (period) {
    case Period.SIXTY_DAYS:
    case Period.NINETY_DAYS:
      period_dates[`p${Period.SIXTY_DAYS}`] = {
        start_date: moment(date).add(1, 'months'),
        end_date: moment(date).endOf('month').add(1, 'months')
      }

      if (period === Period.NINETY_DAYS) {
        period_dates[`p${Period.NINETY_DAYS}`] = {
          start_date: moment(date).add(2, 'months'),
          end_date: moment(date).endOf('month').add(2, 'months')
        }
      }
      break;
  }

  return period_dates;
};

const getPricesFromExternal = async (hotel_id: number, room: Room, start_date: string, end_date: string) => {
  const url = `http://external-api.dev:5000/hotels/${hotel_id}/prices`;
  const reponse = await axios.get(url, { params: { start_date, end_date } });

  // Se manda a guardar los datos recuperados de la api externa
  const request = [];
  const documents: Price[] = [];
  reponse.data.prices[room.room_id][0].forEach(record => {
    let document = { room } as Price;
    Object.keys(record).forEach(key => {
      if (key === 'date') {
        const [DD, MM, YYYY] = record[key].split('/')
        document.date = new Date(`${YYYY}/${MM}/${DD}`);
        return;
      };
      document.competitor_name = key;
      document.currency = record[key].currency;
      document.taxes = record[key].tax;
      document.amount = record[key].price;
      documents.push({ ...document });
      request.push({ insertOne: { document: { ...document } } });
    });
  });

  return { request, prices: documents };
};

/**
 * Función que recupera los precios de los cuartos para un hotel en especifico
 * @param {number} hotel_id id de hotel
 * @param {Room} room habitación
 * @param {Period} period perido solicitado
 * @returns {Promise<Price[]>}
 */
export const getPrices = async (hotel_id: number, room: Room, period: Period, cache: Cache): Promise<Price[]> => {
  try {
    const period_dates = getDates(period);
    let prices: Price[] = []

    for (const key in period_dates) {
      if (!Object.prototype.hasOwnProperty.call(period_dates, key)) continue;
      const { start_date, end_date } = period_dates[key];

      // Se valida si ya han sido guardados los precios en la base para ya no consumir la api externa
      cache.setKey(`price-${room.room_id}-${key}`);
      let data: string | Price[] = cache.getData();
      if (!data) {
        data = await PriceModel.find({
          room,
          date: {
            $gte: new Date(start_date.format(DATE_FORMAT)),
            $lte: new Date(end_date.format(DATE_FORMAT))
          }
        });
        if (data.length > 0) cache.setData(data);
      } else { data = JSON.parse(data); }
      if (data.length > 0) { prices = prices.concat(data as Price[]); continue; }

      // En caso de que no se encuentre datos se realizan las peticiones a la api externa
      const { prices: documents, request } = await getPricesFromExternal(hotel_id, room, start_date.format(GET_DATE_FORMAT), end_date.format(GET_DATE_FORMAT));
      // Se manda a guardar los datos recuperados de la api externa
      const { insertedCount } = await PriceModel.bulkWrite(request);
      prices = await PriceModel.find();
      console.log(`Price records for ID room '${room.room_id}': Total: ${documents.length} | Saved: ${insertedCount}`);
    }

    return prices;
  } catch ({ message }) { throw new Error(message); }
};

/**
 * Función que recupera los precios y genera las metricas para los precios de los cuartos
 * @param {number} hotel_id id de hotel
 * @param {Room} room habitación
 * @param {string} day Fecha solictada como cadena de texto
 * @returns {Promise<Metric[]>}
 */
export const getMetrics = async (hotel_id: number, room: Room, day: string): Promise<Metric> => {
  try {
    const start_date = moment(day).startOf('month').format(GET_DATE_FORMAT);
    const end_date = moment(day).endOf('month').format(GET_DATE_FORMAT);

    // Se busca la metrica primero en la BD antes de hacer algo
    const metric = await MetricModel.findOne({ room, date: new Date(day) });
    if (metric) return metric;

    // Se buscan los precios del cuarto en ese dia para generar las metricas
    let prices: Price[] = await PriceModel.find({ room, date: new Date(day) });
    if (prices.length === 0) {
      // En caso de que no se encuentre datos se realizan las peticiones a la api externa
      const { prices: documents, request } = await getPricesFromExternal(hotel_id, room, start_date, end_date);
      // Se manda a guardar los datos recuperados de la api externa
      const { insertedCount } = await PriceModel.bulkWrite(request);
      prices = [...documents].filter(price => price.date.getTime() === new Date(day).getTime());
      console.log(`Price records for ID room '${room.room_id}': Total: ${documents.length} | Saved: ${insertedCount}`);
    }

    // Se hacen los calculos para obtener las metricas
    prices = prices.sort((a, b) => {
      const a_amount = a.amount + Math.round(a.amount * (a.taxes / 100));
      const b_amount = b.amount + Math.round(b.amount * (b.taxes / 100));
      if (a_amount < b_amount ) return -1;
      if (a_amount > b_amount) return 1;
      return 0;
    });
    const best_price = prices[0];
    const worst_price = [...prices].slice(-1).pop();
    const average_price = prices.length % 2 ? prices[prices.length >> 1] : prices[(prices.length >> 1) - 1];

    // Se crea el registro de metrica y se retorna para el cliente
    console.log('Inicio de la creación de la metrica...');
    return await MetricModel.create({
      room_id: room.room_id,
      room_name: room.room_name,
      date: new Date(day),
      metrics: {
       best_price: {
         competitor_name: best_price.competitor_name,
         gross_amount: best_price.amount,
         net_amount: best_price.amount + Math.round(best_price.amount * (best_price.taxes / 100))
       },
       average_price: {
        competitor_name: average_price.competitor_name,
        gross_amount: average_price.amount,
        net_amount: average_price.amount + Math.round(average_price.amount * (average_price.taxes / 100))
       },
       worst_price: {
          competitor_name: worst_price.competitor_name,
          gross_amount: worst_price.amount,
          net_amount: worst_price.amount + Math.round(worst_price.amount * (worst_price.taxes / 100))
        },
      },
      room
    });
  } catch ({ message }) { throw new Error(message); }
};
