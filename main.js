var college = "COE", term = null;
$(document).ready(function(){
     draw();
     $(".radio-inline").on("click", function(){
       term = $(this).find('input').attr('id'); 
       draw();
    });
    
    $("select").change(function(){
       college = $(this).val();
       draw();
    });
    
    //$("#chart").controlsUseVisibility(true);
});

function draw(){
    d3.csv("hhc_pibb.csv", function(data){
    

    data.forEach(function (d) {
        d.Year = new Date(d.Year,0,1);
        d.headcount_pibb = +d.headcount_pibb;
    });
    
   
    console.log(data);
    //charts in HTML
    var totalEnrChart = dc.bubbleChart('#dc-total-enr');
    var enrByDeptChart = dc.pieChart('#dc-enr-by-dept');
    var totalEnrDeptChart = dc.lineChart('#dc-total-enr-dept');
    var multiLineChart = dc.seriesChart('#dc-multi-line');
  
    
    var facts = crossfilter(data);
    var all = facts.groupAll();

    var yearDim = facts.dimension(function(d){return d.Year;}),
        collDim = facts.dimension(function(d){return d.College;}),
        deptDim = facts.dimension(function(d){return d.Department;}),
        termDim = facts.dimension(function(d){return d.Term;});
        
    var n = all.reduceCount().value();
    console.log(n);
    
    var yearGroup = yearDim.group().reduce(
        function(p,v){
            ++p.count;
            p.hc_pibb += v.headcount_pibb;
            p.year = v.Year;
            return p;
        },
        
        function(p,v){
            --p.count;
            p.hc_pibb -= v.headcount_pibb;
            p.year = v.Year;
            return p;
        },
        
        function(){
            return{
                count: 0,
                hc_pibb: 0,
                year: 0,
            };
        }        
    );
    
    //collDim.filter(college);
    termDim.filter(term);
   /* $(".radio-inline").on("click", function(){
       collDim.filter(($(this).find('input').attr('id'))); 
    });*/
    
   
    var yearValGroup = yearDim.group()
           .reduceSum(function(d){ return d.headcount_pibb; });
   
    totalEnrChart.width(990)
            .height(350)
            .transitionDuration(1500)
            .dimension(yearDim)
            .group(yearValGroup)
            .margins({top:10, right: 50, bottom: 30, left: 50})
            .keyAccessor(function(d){ return d.key; })
            .valueAccessor(function(d){ return d.value; })
            .radiusValueAccessor(function(d){ return d.value/10; })
            .maxBubbleRelativeSize(0.3)
            .x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2016, 0, 1)]))
            .y(d3.scale.linear().domain([1000, 20000]))
            .r(d3.scale.linear().domain([100, 30000]))
            .yAxisLabel("PIBB Headcount")
            .elasticY(true)
            .elasticX(true)
            .renderLabel(false)
            .yAxisPadding(100)
            .xAxisPadding(500);
   
   //totalEnrChart.yAxis().tickFormat(function(d){debugger;return d3.format(',d')(d);});
   // console.log(yearValGroup);
    
    totalEnrDeptChart.width(480)
            .height(350)
            .transitionDuration(1500)
            .margins({top:10, right: 50, bottom: 30, left: 50})
            .dimension(yearDim)
            .group(yearValGroup)
            //.filter(function(d){console.log(d);})
            .elasticY(true)
            .x(d3.time.scale().domain([new Date(2011, 0, 1), new Date(2016, 0, 1)]))
            .y(d3.scale.linear().domain([1000, 20000]))
            .yAxisLabel("PIBB Headcount")
            .yAxisPadding(100)
            .xAxisPadding(500)
            .xAxis();
    
    var deptGroup = deptDim.group()
            .reduceSum(function(d){ return d.headcount_pibb; });
    
    enrByDeptChart.width(480)
            .height(350)
            .radius(160)
            .dimension(deptDim)
            .group(deptGroup);

   
    var collYearDim = facts.dimension(function(d){return [d.Year, d.College];})
    var collYearGroup = collYearDim.group()
            .reduceSum(function(d){ return +d.headcount; });
    dc.registerChart(multiLineChart, "nofilter");
    //collDim.filterAll("nofilter");
    //multi-line chart
    multiLineChart.width(868)
            .height(480)
            .chart(function(c){return dc.lineChart(c).interpolate('linear')})
            .x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2016, 0, 1)]))
            .y(d3.scale.linear().domain([1000, 100000]))
            .brushOn(false)
            .yAxisLabel("Head Count")
            .xAxisLabel("Years")
            .clipPadding(10)
            .elasticY(true)
            .dimension(collYearDim)
            .group(collYearGroup)
            .mouseZoomable(true)
            .seriesAccessor(function(d) {return d.key[1];})
            .keyAccessor(function(d) {return d.key[0];})
            .valueAccessor(function(d) {return d.value;})
            .legend(dc.legend().x(750).y(350).itemHeight(13).gap(5).horizontal(2).legendWidth(140).itemWidth(70));
    dc.renderAll();
    
});
}
