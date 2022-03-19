import axios from 'axios';
import { HotelModel } from '../entities';


export class DBFulFill {
  static fill = async () => {
    try {
      const ids = [1, 2, 3, 4, 5];
      const hotels = [];

      // Se valida si ya se han registrado los 
      if ((await HotelModel.find()).length > 0) return false;

      const response = await axios.all(ids.map(id => axios.get(`http://external-api.dev:5000/hotels/${id}`)));
      for (const { data, request } of response) {
        const id = request.path.split('/').at(-1);
        data.hotel_id = id;
        hotels.push({ insertOne: { document: data } });
      }
      const { insertedCount } = await HotelModel.bulkWrite(hotels);
      console.log('Total Hotel records created:', insertedCount);
    } catch ({ message }) { console.error('DBFulFill ~ fill() --> Error:', message); }
  };
}
