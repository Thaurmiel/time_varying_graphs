
import mysql from 'mysql2'

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', //
    password: 'Supern0va', //
    database: 'gg_bk',
  }).promise()

