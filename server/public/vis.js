const socket = io();

const min_field = document.getElementById('min');
const max_field= document.getElementById('max');

socket.on('graph_time_data',(time_data)=>{

  min_field.innerHTML = new Date(time_data.min).toUTCString();
  max_field.innerHTML = new Date(time_data.max).toUTCString();
  console.log(time_data)
})

socket.on('graph_data',(graph)=>{
    const container = document.getElementById("mynetwork");
    let nodesDataset = new vis.DataSet(graph.nodes); 
    let edgesDataset = new vis.DataSet(graph.edges); 
    let data = {nodes:nodesDataset, edges:edgesDataset}

    let options = {
        edges: {
          smooth: false
        },
        nodes: {
            shape: "dot",
            size: 16,
          },
        physics: {
          forceAtlas2Based: {
            gravitationalConstant: -50,
            springLength: 220,
            springConstant: 0.2,
            damping: 0.7
          },
          minVelocity: 0.75,
          solver: "forceAtlas2Based",
          timestep: 0.1

        }
      }
    network = new vis.Network(container, data, options);
  
})


/*var options = {
  "edges": {
    "smooth": false
  },
  "physics": {
    "forceAtlas2Based": {
      "gravitationalConstant": -50,
      "springLength": 220,
      "springConstant": 0.2,
      "damping": 0.7
    },
    "minVelocity": 0.75,
    "solver": "forceAtlas2Based",
    "timestep": 0.09
  }
}
*/
