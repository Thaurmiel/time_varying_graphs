const mysql = require('mysql2/promise');

const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

let full_graph = null;
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});



const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', //
    password: 'Supern0va', //
    database: 'gg_bk'
  })


class DataHolder  {
  constructor(tablename){
    this.tablename=tablename;
    this.data = []
  }
}

  async function getTablenames (){
    try{
      const tables = []
      const result = await pool.query('show tables')
      const tablename =result[1][0].name
      result[0].forEach(element => {
        tables.push((element[tablename]))
      });
      return tables
    }catch(err){
      console.log('ERROR => ' + err);
      return err;
    }

  }

async function getDBData (tables){
  const tabledata = []
  for await(const table of tables) {
    const query =`select * from ${table};`;
    const dataFromTable = await pool.query(query)
    const result = new DataHolder(table);
    result.data = dataFromTable[0];
    tabledata.push(result)
  }
  return tabledata
}


(async () => {
  let a = Date.now()
  const result = await getTablenames();
  let b = Date.now()
  const DBDATA = await getDBData(result);
  let c = Date.now()
  console.log(new Date(a), b-a, c-a)
  //console.log("On graph construction")

const graph = {edges:[], nodes:[]};
const node_to_data = [];
const edge_to_data = [];
let node_counter = 1;
let edge_counter = 1;
for(let table of DBDATA) // table
{

  //console.log("On table",table.tablename,table.data.length, 'rows');

  const table_data = table.data;
  let row_keys=Object.keys(table_data[0]);
  for(let row in table_data) // table row
  {
    const current_row = table_data[row];
    // add node
    let node = {
      id:node_counter
    }

    node_counter++;

    const node_connector = {
      node:{
        id:node.id
      },
      table:{
        name:table.tablename,
        row_id:table_data[row].id
      }
    } 
    // node added, check if edges exist on row
    const row_edges = [] // several edges from one node is possible

    for(let key of row_keys){
      let element_data = current_row[key]

      //console.log("element data",key,current_row[key])
      
      if(key.endsWith('_id'))
      {
        const edge_connector = {
          edge:{
            id:edge_counter       // edge get own id
          },
          node:{
            from_node:node.id     // node id already known
          },
          table:{
            name:table.tablename,
            to_row_id:element_data // id expected on name "..._id", possible that node id is not present yet
          }
        }
        edge_counter++;
        row_edges.push(edge_connector)
      }
      else if(key.endsWith('_name'))
      {
        node['name'] = element_data
      }
      else if(!key.endsWith('id')){                           
        node[key] = element_data  // if additinal info exist, add data to node
      }
      node_to_data.push(node_connector);  
    }
    if(row_edges.length!=0)
    {
      edge_to_data.push(...row_edges) // merge two arrays into one without creating new array: (row_edges) to (...row_edges) hits 7244-5382 = 1862 times
    }
    graph.nodes.push(node);
  }
}
//console.log(node_counter,graph.nodes.length) 

//console.log("Node to data",node_to_data.length,node_to_data[0])
//console.log("Edge to data",edge_to_data.length,edge_to_data[0])

for(let row of edge_to_data)
{

  const target_table = row.table.name;
  const target_table_row_id = row.table.to_row_id;

  const target_end_node = node_to_data.find(x=>x.table.name == target_table && x.table.row_id == target_table_row_id)

  const edge = {
    id:row.edge.id,
    source:row.node.from_node,
    target:target_end_node.node.id
  }

  graph.edges.push(edge)
  full_graph = graph;
}
})()



server.listen(port, () => {
  console.log('Server listening at port %d', port);
});




io.on('connection', (socket) => {
  console.log(full_graph)
  console.log('user connected')
  })



// on this moment, graph representation is ended

// create clean node and edge as follows

/*
node:{
  id:
  name:
  additional info
}
edge:{
  from:
  to:
}
*/