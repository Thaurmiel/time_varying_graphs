import { createConnection } from 'mysql2';
const database = 'gg_bk';
const connection = createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Supern0va',
  database:database
});


function getTimeLength(startTime){
  let timeNow = Date.now();
  let now =  timeNow - startTime;
  console.log("Time from start: "+ now +" miliseconds");
}

function mySQLcompatibleDateTime(date){
  const newDate = new Date(date)
  return newDate.toISOString().slice(0, 19).replace('T', ' ');
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function addTime(date, minutes) {
  return new Date(date + minutes).getTime();
}


// time constants
const startTime = Date.now();
const second = 1000;
const minute = 60 * second; // might be bad
//const minute = 1; // try late, breaks time adding logics
const hour = minute * 60;
const day = hour * 24;

const timeTick = 10 * minute;
const simulatedTimeAmount = 12 * day; // 2 weeks
const simulatedEndTime = addTime(startTime,simulatedTimeAmount);
const tickAmount = (simulatedTimeAmount)/timeTick;


// simulation variables
const roomAmount = 4;
const ouAmount = 4;
const workerAmount = 50;
const teamAmount = 10;
const sensorAmount = roomAmount;
const maxMeetingAmount = 4;
const maxEventAmount = Math.round(tickAmount * 0.1);


class TableHolder
{
  constructor(name,tableRows)
  {
    this.name = name;
    this.tableRows = tableRows;
  }
}

let tableArray = [];// stores all tables
let counter = 1;
let tableValues = []; // stores one table data

// inserting organisation units

tableValues = [];

while(counter<=ouAmount)
{
  let ouName = "Organization unit "+counter;
  let tableData = 
  {
    id: counter,
    ou_name: ouName,
    ou_master: 1
  }
  tableValues.push(tableData);
  counter++;
}

let oUnits = new TableHolder('ou',tableValues)

tableArray.push(oUnits);

// inserting teams
counter = 1;
tableValues = [];

while(counter<=teamAmount)
{
  let teamOU = getRandomInt(1, ouAmount)
  let tName = "Team "+counter;

  let tableData = 
  {
    id: counter,
    t_name: tName,
    t_ou_id: teamOU
  }
  tableValues.push(tableData);
  counter++;
}

let teams = new TableHolder('teams',tableValues)

tableArray.push(teams);

// inserting workers
counter = 1;
tableValues = [];

while(counter<=workerAmount)
{
  let workerTeam = getRandomInt(1, teamAmount)
  let workerName = "Worker "+counter;
  //let workerOU = teams.tableRows.find(x=>x.id == workerTeam).t_ou_id; not used anymore
  
  let tableData = 
  {
    id: counter,
    w_name: workerName,
    w_team_id: workerTeam
  }
  tableValues.push(tableData);
  counter++;
}

let workers = new TableHolder('workers',tableValues)

tableArray.push(workers);

// inserting rooms
counter = 1;
tableValues = [];

while(counter<=roomAmount)
{
  let roomSize = Math.random()>0.5? "BIG":"MEDIUM";
  let roomName = "Room "+counter;
  let tableData = 
  {
    id: counter,
    r_name: roomName,
    r_type: roomSize
  }
  tableValues.push(tableData);
  counter++;
}

let rooms = new TableHolder('rooms',tableValues)

tableArray.push(rooms);

// inserting sensors, using room id's
counter = 1;
tableValues = [];
  
while(counter<=sensorAmount)
{
  let sensorName = "Room's "+counter+" sensor";
  let tableData = 
  {
    id: counter,
    s_name: sensorName,
    s_room_id: counter
  }
  tableValues.push(tableData);
  counter++;
}
let sensors = new TableHolder('sensors',tableValues)

tableArray.push(sensors);
let tempTime=startTime;
let meetingCounter = 1;
let eventCounter = 0;

let meetingProb = (maxMeetingAmount/tickAmount);
console.log("Meeting chance is:",meetingProb)

tableValues = [];
while(tempTime<=simulatedEndTime)
{
  let randvalue = Math.random();
  if( meetingCounter<maxMeetingAmount && randvalue<=meetingProb )
  {
    
    let meetingName = "Meeting "+(meetingCounter);
    let roomID = getRandomInt(1, roomAmount);
    let start_time = tempTime;
    let end_time = addTime(start_time, 45 * minute);
    let tableData = 
    {
      id: meetingCounter,
      m_start_time:start_time,
      m_end_time:end_time,
      m_name: meetingName,
      m_room_id: roomID
    }
    //console.log("Meeting hit after", Math.round((start_time-startTime)/hour),"hours after simulation start",tableData)
    tableValues.push(tableData);
    meetingCounter++;
  }
  //console.log("Time :",(tempTime-startTime)/minute,"minute","Values:",meetingCounter, maxMeetingAmount, "Success?:", randvalue<=meetingProb?"Pass":"Fail")
  //console.log( randvalue,meetingProb,tempTime/minute,"minute:",randvalue<=meetingProb?"MEETING":"---------------")
  // next iteration 
  tempTime+=timeTick;
}
let meetings = new TableHolder('meetings',tableValues) //meetings

//tableArray.push(events);
tableArray.push(meetings);

console.log("Meetings amount:",meetingCounter-1, "of",maxMeetingAmount)
meetingCounter = 0;
tableValues = [];

tempTime = startTime;

let meetingTable = meetings.tableRows;

let eventProb = (maxEventAmount/tickAmount);
let eventProximityRange = 30 * minute; // 30 minutes to come to meeting
let eventProbInProximityMod = 2;

function eventInMeetingRange(eventTime, meetingTime, range=eventProximityRange) {
  let meetingRange ={
    min:meetingTime-range,
    max:meetingTime+range
  }
  // if in range, return true, else false
  let answer = {
    inRange:eventTime>= meetingRange.min && eventTime<= meetingRange.max?true:false,
    rangeEnd:meetingRange.max
  }
  return answer;
}

let rangeChanged=false;
let meetingRangeEnd=0;

while(tempTime<=simulatedEndTime && eventCounter<=maxEventAmount && meetingCounter<meetings.tableRows[meetings.tableRows.length - 1].id)
{
  let meetingProximity = eventInMeetingRange(tempTime,meetingTable[meetingCounter].m_start_time);
  let tempEventProb = eventProb;

  if(meetingProximity.inRange)
  {
    tempEventProb*=eventProbInProximityMod
    if(meetingRangeEnd==0)
    {
      meetingRangeEnd = meetingProximity.rangeEnd
    }
    else
    {
      meetingRangeEnd = meetingProximity.rangeEnd
      rangeChanged = true;
    }
  }

  //console.log("Time left in hours:",(tempTime-startTime)/hour,", events left",maxEventAmount-eventCounter);
  let randvalue = Math.random();
  if(randvalue<=tempEventProb)
  {
    let sensor_id = meetingTable[meetingCounter].m_room_id;
    let worker_id = getRandomInt(1,workerAmount);
    let event_time = tempTime;
    let tableData = 
    {
      id: eventCounter+1,
      s_id:sensor_id, // meeting.room.sensor.id
      w_id:worker_id, // just random worker
      event_time:event_time, // 
      event_type:"IN"
    }
    eventCounter++;
    tableValues.push(tableData);
    tableData = 
    {
      id: eventCounter+1,
      s_id:sensor_id, 
      w_id:worker_id, 
      event_time:event_time+getRandomInt(15*minute,45*minute), // 
      event_type:"OUT"
    }
    tableValues.push(tableData);
    eventCounter++;
    if(rangeChanged)
    {
      rangeChanged=false;
      meetingCounter++;
    }
  }

  tempTime+=timeTick;
}

let events = new TableHolder('sensor_events',tableValues) //meetings
tableArray.push(events);

tableArray.forEach(element => 
  {

      element.tableRows.forEach(row =>{
        connection.query('INSERT  INTO '+ element.name+' SET ?', row, (err, result) => {
          if (err) throw err;
        });
      })
  });

// Close the database connection
connection.end((err) => {
  if (err) {
    console.error('Error closing database connection: ' + err.stack);
    return;
  }
  console.log('Database connection closed.');
});

console.log("Done in :",Date.now()-startTime,"miliseconds.")
console.log("Simulation length",simulatedTimeAmount/hour,"hours.")
console.log("Ticks in simulation",tickAmount,"ticks.")
console.log("Tick time, something can happen every:",(simulatedTimeAmount/tickAmount)/hour, "hours.")
console.log("Average time betveen meetings:",(simulatedTimeAmount/maxMeetingAmount)/hour, "hours.")
