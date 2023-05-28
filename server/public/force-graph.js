const socket = io();
function addEventNames(nodes)
{
    nodes.forEach(node => {
        if(node.group == "sensor_events")
        {
        node["group"] = node["event_type"];
        node["label"] = node["event_type"]+", "+ dateFormat(new Date(node["event_time"]*1))
        }
    
    });
}
socket.on('graph_data', (graph) => {

    
    addEventNames(graph.nodes)
    graph.links = graph.edges;
    const Graph = ForceGraph()
    (document.getElementById('graph'))
    .graphData(graph)
    .nodeId('id')
    .nodeVal('val')
    .nodeLabel('label')
    .nodeAutoColorBy('group')
    .linkSource('from')
    .linkTarget('to')
    //eventFormat(nodesDataset, edgesDataset, "sensor_events")
    console.log(Graph)



    })

    function dateFormat(date) {

        let answerString = `${date.getUTCDate()}.${date.getUTCMonth()}.${date.getUTCFullYear()},  ${date.getUTCHours()}:${date.getUTCMinutes()} `;
        return answerString
      }