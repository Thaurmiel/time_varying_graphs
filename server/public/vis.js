const socket = io();
socket.on('graph_data',(graph)=>{
    console.log(graph)
    const container = document.getElementById("mynetwork");


    var nodesDataset = new vis.DataSet(graph.nodes); 
    var edgesDataset = new vis.DataSet(graph.edges); 
    let data = {nodes:nodesDataset, edges:edgesDataset}

    var options = {
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
