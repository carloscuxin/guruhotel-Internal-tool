import { connect } from 'mongoose';
import { UserModel } from '../entities';
import { Role } from '../utils/Enum';


export class DBConnection {
  public connect = async () => {
    try {
      const db = await connect('mongodb://mongo-db/guru_hotel');
      console.log('Db connected to', db.connection.host);
      await this.createUsers();
      return db;
    } catch (error) {
      console.error('Something went wrong.', error);
    }
  };

  private createUsers = async () => {
    try {
      if ((await UserModel.find()).length === 0) {
        const users = await UserModel.create([
          { user: 'admin', role: Role.MANAGER },
          { user: 'public_user', role: Role.PUBLIC },
        ]);
        console.log('Users ~ Total saved:', users.length);
      }
    } catch (error) { console.error(error.message); }
  }
}
