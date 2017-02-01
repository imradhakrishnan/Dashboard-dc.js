d3.csv("hhc_pibb.csv", function(data){
    
    var dateFormat = d3.time.format('%Y');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.Year = new Date(d.Year,0,1);
        d.headcount_pibb = +d.headcount_pibb;
    });
    
   
    console.log(data);
    //charts in HTML
    var totalEnrChart = dc.bubbleChart('#dc-total-enr');
    var enrByDeptChart = dc.pieChart('#dc-enr-by-dept');
    var totalEnrDeptChart = dc.lineChart('#dc-total-enr-dept');
    
    var facts = crossfilter(data);
    var all = facts.groupAll();

    var yearDim = facts.dimension(function(d){return d.Year;}),
        collDim = facts.dimension(function(d){return d.College;}),
        deptDim = facts.dimension(function(d){return d.Department;}),
        termDim = facts.dimension(function(d){return d.Term;});
        
    var n = all.reduceCount().value();
    console.log(n);
    /*
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
    */
    collDim.filter("COE");
    //termDim.filter("Fall");
   
    var yearValGroup = yearDim.group()
           .reduceSum(function(d){ return d.headcount_pibb; });
   
    totalEnrChart.width(990)
            .height(250)
            .transitionDuration(1500)
            .dimension(yearDim)
            .group(yearValGroup)
            .colorAccessor(function(d){  return d.value; })
            .keyAccessor(function(d){ return d.key; })
            .radiusValueAccessor(function(d){ return d.value/10; })
            .maxBubbleRelativeSize(0.3)
            .x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2016, 0, 1)]))
            .y(d3.scale.linear().domain([1000, 70000]))
            .r(d3.scale.linear().domain([0, 70000]))
            .elasticY(false)
            .elasticX(true)
            .renderLabel(false)
            .yAxisPadding(100)
            .xAxisPadding(500);
            
    console.log(yearValGroup);
    
    totalEnrDeptChart.width(480)
            .height(350)
            .transitionDuration(1500)
            .dimension(yearDim)
            .group(yearValGroup)
            .elasticY(true)
            .x(d3.time.scale().domain([new Date(2011, 0, 1), new Date(2016, 0, 1)]))
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

    dc.renderAll();
    
});

