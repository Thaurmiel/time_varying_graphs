const socket = io();
const graph_element = document.getElementById('graph');

socket.on('graph_data',(graph)=>{
    const options = {}

    console.log(graph)



      const Graph = ForceGraph()(graph_element)
        .nodeId('id')
        .nodeLabel(node => ()=>{
          if('name' in node){
            return `${node.name}: ${node.data}`
          }
          
        })
        .graphData(graph)
})


/*
    if (typeof graph.nodes.name == 'undefined') {
      graph.nodes.name = "Sensor_event"
      // the variable is defined
    }
*/