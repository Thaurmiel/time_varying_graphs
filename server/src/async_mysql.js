const connection = require("./connection")
const db_name = connection.config.database;

module.exports = {
    getData: async (req, res) => {
       let queryString = `show tables`;
    
       const [tables] = await db.query(queryString).catch(err => {throw err}); 
       console.log(tables)
       /*
       results.forEach(tablename => {
        database_tables.push((tablename[`Tables_in_${db_name}`]))
      });
      */
       res.json(tables); 
    }
   }