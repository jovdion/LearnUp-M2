import { Sequelize } from 'sequelize';

const dbContext = new Sequelize("learnup", "root", "", {
  host: "localhost",
  dialect: "mysql",
}); // Database name

export default dbContext;