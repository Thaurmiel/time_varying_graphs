import { pool } from './src/connection.mjs';
import { DataHolder } from './src/dataholder.mjs';
import * as fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
const app = express();

import http from 'http';
const server = http.createServer(app)

import { Server } from 'socket.io';
const io = new Server(server, { cors: { origin: '*' } });

const port = process.env.PORT || 3000;

let graph_ready = false;


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');// send html
});
app.get('/htree', (req, res) => {
  res.sendFile(__dirname + '/public/hierarhy.html');// send html
});
app.get('/force', (req, res) => {
  res.sendFile(__dirname + '/public/force-graph.html');// send html
});





app.use(express.static(__dirname + '/public'));// allow to see public

io.on('connection', (socket) => {

  console.log('Connection established on socket.id', socket.id);

  if (graph_ready) {
    socket.emit('graph_data', full_graph);
    socket.emit('graph_time_data', graph_time)
  }

  else {
    socket.emit('graph_not_ready');
    socket.emit('graph_data',
      graph = {
        edges: [
          { id: 1, label: "Graph" },
          { id: 2, label: "not" },
          { id: 3, label: "ready" },
          { id: 4, label: "yet" }],

        nodes: [
          { from: 1, to: 2 },
          { from: 3, to: 2 },
          { from: 3, to: 4 }]
      })
  }
  socket.on('stats',(stats)=>{
    console.log(stats)
    let tmpstr = stats.join()+"\n";
    fs.appendFile("./server/src/stats_big.txt", tmpstr, (err) => {
      if (err) {
        console.log(err);
      }
    });

  })

})

server.listen(port, () => {
  console.log('Server listening at port %d', port);

});
// jobs on server start

let full_graph = [];
let graph_time = [];

graph_preprocess();


// end of server setup
async function graph_preprocess() {
  full_graph = await get_db_graph();
  graph_time = get_time(full_graph);
}

async function get_references() {
  const references = []
  const query = `
  SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
    FROM
      INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      TABLE_SCHEMA = SCHEMA()               
      AND REFERENCED_TABLE_NAME IS NOT NULL;`
  const result = await pool.query(query);

  return result[0]
}



async function getTablenames() {
  try {
    const tables = []
    const result = await pool.query('show tables')
    const tablename = result[1][0].name
    result[0].forEach(element => {
      tables.push((element[tablename]))
    });
    return tables
  } catch (err) {
    console.log('ERROR => ' + err);
    return err;
  }

}

async function getDBData(tables) {
  const tabledata = [];
  for await (const table of tables) {

    const query = `select * from ${table};`;
    const dataFromTable = await pool.query(query);
    const result = new DataHolder(table);
    result.data = dataFromTable[0];
    tabledata.push(result);
  }
  return tabledata;
}

async function get_DB_data() {
  const tables = await getTablenames();
  const dbdata = await getDBData(tables);
  return dbdata;
}

async function get_db_graph() {
  let starttime = Date.now()

  const db_data = await get_DB_data();

  const references = await get_references()
  const graph = { edges: [], nodes: [] };
  const node_to_data = [];
  const edge_to_data = [];
  let node_counter = 1;
  let edge_counter = 1;

  for (let table of db_data) {

    //console.log("On table",table.tablename,table.data.length, 'rows');

    const table_data = table.data;
    let row_keys = Object.keys(table_data[0]);
    for (let row in table_data) // table row
    {
      const current_row = table_data[row];
      // add node
      let node = {
        id: node_counter,
        group: table.tablename

      }

      node_counter++;

      const node_connector = {
        node: {
          id: node.id
        },
        table: {
          name: table.tablename,
          row_id: table_data[row].id
        }
      }
      // node added, check if edges exist on row
      const row_edges = [] // several edges from one node is possible

      for (let key of row_keys) {
        let element_data = current_row[key]

        //console.log("element data",key,current_row[key])

        if (key.endsWith('_id')) {
          const reference_table = references.find(x => x.COLUMN_NAME == key)
          const edge_connector = {
            edge: {
              id: edge_counter       // edge get own id
            },
            node: {
              from_node: node.id     // node id already known
            },
            table: {
              name: reference_table.REFERENCED_TABLE_NAME,
              to_row_id: element_data // id expected on name "..._id", possible that node id is not present yet
            }
          }
          edge_counter++;
          row_edges.push(edge_connector)
        }
        else if (key.endsWith('_name')) {
          node['label'] = element_data
        }
        else if (!key.endsWith('id')) {
          node[key] = element_data  // if additinal info exist, add data to node
        }

      }
      node_to_data.push(node_connector);
      if (row_edges.length != 0) {
        edge_to_data.push(...row_edges) // merge two arrays into one without creating new array: (row_edges) to (...row_edges) hits 7244-5382 = 1862 times
      }
      graph.nodes.push(node);
    }
  }

  //console.log(node_counter,graph.nodes.length) 

  //console.log("Node to data",node_to_data.length,node_to_data[0])
  //console.log("Edge to data",edge_to_data.length,edge_to_data[0])
  let counter = 0
  for (let row of edge_to_data) {

    const target_table = row.table.name;
    const target_table_row_id = row.table.to_row_id;

    const target_end_node = node_to_data.find(x => x.table.name == target_table && x.table.row_id == target_table_row_id)

    const edge = {
      //id:row.edge.id,
      from: row.node.from_node,
      to: target_end_node.node.id
    }
    graph.edges.push(edge)
  }
  //console.log("Node connector",node_to_data)


  graph_ready = true;
  let endtime = Date.now()
  console.log("DB data gotten in:",endtime-starttime,"ms;", "Nodes - edges amount in graph:",graph.edges.length, graph.nodes.length)
  return graph;
}

function get_time(graph) {

  const graph_time = {
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
    time: []

  }
  graph.nodes.forEach(node => {
    const node_keys = Object.keys(node)

    node_keys.forEach(key => {
      if (key.endsWith("_time")) {
        const temp_time = node[key]
        
        temp_time > graph_time.max ? graph_time.max = temp_time : "";
        temp_time < graph_time.min ? graph_time.min = temp_time : "";

        let label = "";
        node.label === undefined ? label = node.event_type : label = node.label;

        graph_time.time.push({
          id: node.id,
          label: label,
          datetime: node[key]
        })
      }
    });

    graph_time.time.sort(function (a, b) {
      let keyA = a.datetime, keyB = b.datetime;
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });

  });
  graph_time.min = parseInt(graph_time.min);
  graph_time.max = parseInt(graph_time.max);
  return graph_time;
}

