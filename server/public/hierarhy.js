

const socket = io();
const graph_element = document.getElementById('graph');


let minTime = document.getElementById('x1')
let maxTime = document.getElementById('x2')
let rangeButton = document.getElementById('b1')
let tiemRange = document.getElementById('range')

let selectedTimestampMin = 0;
let selectedTimestampMax = 0;
let network; // vis instance
let nodesDataset;
let edgesDataset;
let view;

rangeButton.addEventListener('click', () => {
  // filter events
  view = new vis.DataView(nodesDataset, {
    filter: function (node) {
      if ("event_time" in node) {
        // if in selected range
        return (node.event_time >= selectedTimestampMin && node.event_time <= selectedTimestampMax);
      }
      else return node
    }
  })

  // remove unused nodes
  // remove unused edges
  network.setData({ nodes: view, edges: edgesDataset })

})



// range slider logic
let dvr = new DualHRange('dhr', { lower: 0.2, upper: 0.8, minSpan: 0 })

dhr.addEventListener('update', (event) => {
  
  selectedTimestampMin = Math.floor(event.detail.lower)
  selectedTimestampMax = Math.floor(event.detail.upper)
  let minDateUTC = new Date(selectedTimestampMin)
  let maxDateUTC = new Date(selectedTimestampMax)
  minTime.innerText = dateFormat(minDateUTC)
  maxTime.innerText = dateFormat(maxDateUTC)
});

function dateFormat(date) {

  let answerString = `${date.getUTCDate()}.${date.getUTCMonth()}.${date.getUTCFullYear()},  ${date.getUTCHours()}:${date.getUTCMinutes()} `;
  return answerString
}
// range slider logic end

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
  const container = document.getElementById("mynetwork");
  nodesDataset = new vis.DataSet(graph.nodes);
  edgesDataset = new vis.DataSet(graph.edges);
  //eventFormat(nodesDataset, edgesDataset, "sensor_events")
  let data = { nodes: nodesDataset, edges: edgesDataset }
  console.log(data)
  let options = {
    nodes: {
      shape: "dot",
      scaling: {
        min: 10,
        max: 30,
        label: {
          min: 8,
          max: 30,
          drawThreshold: 2,
          maxVisible: 30,
        }
      }
    },
    layout: {
      hierarchical: {
        direction: "UD",
      },
    },
      interaction: {
        tooltipDelay: 200,
        hideEdgesOnDrag: true
      },
  }
  network = new vis.Network(container, data, options);

})


socket.on('graph_time_data', (time_data) => {
  console.log(time_data)

  dvr.lowerBound = time_data.min;
  dvr.upperBound = time_data.max;

  //set max span to prevent too big dataset


  minTime.innerHTML = dateFormat(new Date(time_data.min));
  maxTime.innerHTML = dateFormat(new Date(time_data.max));

})


// unused

function eventFormat(nodes, edges, targetName) {
  let counter = 0;
  let tempends = [];
  let newedge ={};
  nodes.forEach(node => {
    //every target node 
    if (node.group == targetName) {
      // get start id
      const nodeid = node.id
      // find in edges
      let targetEdges = edges.get({
        filter: function (item) {
          return (item.from == nodeid);
        }
      })



      targetEdges.forEach(element => {
        tempends.push(element.to)

        counter++
        if (counter > 1) // if full edge
        {
          counter = 0;
          // add node data to edge  
          for (let key of Object.keys(node)) {

            if (key != "id" && key != "group") {
              newedge[key] = node[key]
            }
          }
          console.log(node,new Date(node["event_time"]))
          // add edge destinations
          newedge["from"] = tempends[0];
          newedge["to"] = tempends[1];
          newedge["label"] = node["event_type"]+", "+ dateFormat(new Date(node["event_time"]*1))

          // push new edge
          edges.add(newedge)

          // clear old data
          tempends = [];
          newedge = {};
          edges.remove(element.id)
          nodes.remove(nodeid)
        }
      });
    }
  });

}