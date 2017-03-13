/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*Plotly.d3.csv("hhc_pibb.csv", function(err, rows){
    data.forEach(function (d) {
        d.Year = new Date(d.Year,0,1);
        d.headcount_pibb = +d.headcount_pibb;
    });
});
*/
var college = "COE", term = null, dept = [], isRefresh = true, currentYear = 2014;
$(document).ready(function(){
     draw();
     
     $(".radio-inline").on("click", function(){
       term = $(this).find('input').attr('id'); 
       draw();
    });
    
    $("#college").change(function(){
       college = $(this).val();
       dept = []; // to reset department var
       isRefresh = true;
       draw();
    });
    $("#department").change(function(){
       dept = $(this).val();
       isRefresh = false;
       draw();
    });
    //$("#chart").controlsUseVisibility(true);
});

function draw(){
    Plotly.d3.csv("hhc_pibb.csv", function(err, data){
    

    data.forEach(function (d) {
        d.Year = new Date(d.Year,0,1);
        d.headcount_pibb = +d.headcount_pibb;
    });
    
 
    //charts in HTML
   var facts = crossfilter(data);
   var filterDim = facts.dimension(function(d){return [d.Year, d.College, d.Department];});

   //to set dept filter
   if(isRefresh){
    filterDim.filter(function(d){return d[1] === college;});   
    var filteredData = filterDim.top(Infinity);
    setDepartmentFilter(filteredData);
   }
   var plotdata = makeTrace(filterDim);
   
   var layout = {
        title: 'Head Count - ' + college,
        xaxis: {
            title: 'Year',
            type: 'date',
            autorange: true,
            showgrid: false,
            zeroline: true,
            showline: true
        },
        yaxis: {
            title: 'Head Count',
            showgrid: false,
            zeroline: true,
            showline: true
        }    
   }
   Plotly.newPlot('dc-multi-line', plotdata, layout);
    
});
}

function makeTrace(filterDim){
    filterDim.filterAll();
    var trace =[];
    if(dept.length == 0){
        dept.push(null);
    }
  dept.forEach(function(department){ 
   filterDim.filter(function(d){return d[1] === college && d[0].getFullYear() <= 2014 && (department === null || d[2] === department );});
   var filteredData = filterDim.top(Infinity);
   var originalData = groupData(filteredData);
   var keyvalue = getKeyValue(originalData);
   
   var trace1 = {
       x: keyvalue[0],
       y: keyvalue[1],
       name: 'actual - '+ (department === null ? college : department),
       type: 'scatter',
       line: {
           shape: 'spline',
           smoothing: 0.25
       }
   };
   
   //projected data
   filterDim.filterAll(); //to clear old filter
   filterDim.filter(function(d){return d[1] === college && d[0].getFullYear() >= 2014 && (department === null || d[2] === department);});
   filteredData = filterDim.top(Infinity);
   originalData = groupData(filteredData);
   keyvalue = getKeyValue(originalData);
   trace.push(trace1);
   var trace2 = {
       x: keyvalue[0],
       y: keyvalue[1],
       mode: 'lines',
       name: 'projected - ' + (department === null ? college : department),
       line:{
           dash: 'dot',
           width: 4,
           shape: 'spline',
           smoothing: 0.25
       }
   };
   trace.push(trace2);
  });
   return trace;
}
function setDepartmentFilter(filteredData){
    //set departments filter
   var allDepts = unpack(filteredData, 'Department');
   var listofDepts = [];
   for (var i = 0; i < allDepts.length; i++ ){
        if (listofDepts.indexOf(allDepts[i]) === -1 ){
            listofDepts.push(allDepts[i]);
        }
    }
    
    var listitems = "<option value='' selected disabled>Select a department</option>";
    listofDepts.forEach(function(d) 
    {
        listitems += '<option value="' + d + '">' + d + '</option>';
    });
    $("#department").empty();
     $("#department").append(listitems);
     $('.selectpicker').selectpicker('refresh');
}

function unpack(rows, key){
    return rows.map(function(row) { return row[key]; });
}
function getKeyValue(originalData){
    var keys=[], values=[];
    originalData.forEach(function(d){
        keys.push(d.key);
        values.push(d.value);
    });
    return [keys, values];
}

function groupData(data){
    var facts = crossfilter(data);
    var originalDim = facts.dimension(function(d){return d.Year.getFullYear();});
    var originalGroup = originalDim.group().reduceSum(function(d){return +d.headcount; });
    return originalGroup.all();
}
