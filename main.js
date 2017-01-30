d3.csv("hhc_pibb.csv", function(data){
    
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.Year = +d.Year;
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
    var yearlyEnr = yearlyDimension.group().reduce({
        
    });
    console.log(yearlyDimension);
    
});

