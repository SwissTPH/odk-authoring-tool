var treeData = {
    name: "Question 1",
    id: 'guid-1',
    children: [
        {
            name: "Question 2",
            id: 'guid-2',
            qOpts: {
                type: "text"
            },
            children: [
                {
                  name: "Question 3",
                  id: 'guid-3',
                  qOpts: {
                    type: "combo"
                  }
                },
                {
                  name: "Question 4",
                  id: 'guid-4'
                }
            ]
        }
    ]
};


// tree config

var containerName = '.tree';
var size = {width: 600, height: 300};
var maxLabelLength = 30;
var options = {
    nodeRadius: 8,
    fontSize: 14,
    strokeColor: "grey",
    strokeWidth: 1,
    labelOffset: 4
};

$(document).ready(function(){

/*
  // extend d3 with own functions
  d3.selection.enter.prototype.addNodeData = d3.selection.prototype.addNodeData = function(n){
    function nodeFunction() {
      var x = n.apply(this, arguments);
      console.debug('downtherabbithole',x,this,arguments);
    }

    return this.each(nodeFunction());
  };

  console.debug(d3.selection.prototype);
*/

  var tree = d3.layout.tree()
      .sort(null)
      .size([size.height, size.width - maxLabelLength*options.fontSize]).children(function(d)
      {
          return (!d.children || d.children.length === 0) ? null : d.children;
      });

      /*
           <svg>
               <g class="container" />
           </svg>
        */
       var layoutRoot = d3.select(containerName)
           .append("svg:svg").attr("width", size.width).attr("height", size.height).append("svg:g")
           .attr("class", "container")
           .attr("transform", "translate(" + maxLabelLength + ",20)");


function update(source){

  var nodes = tree.nodes(source);
  var links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * (size.height/nodes.length); });

 // Edges between nodes as a <path class="link" />
 var link = d3.svg.diagonal()
     .projection(function(d)
     {
         return [d.x, d.y];
     });

 var treeLinks = layoutRoot.selectAll("path.link")
     .data(links)
     .append("svg:path")
     .attr("class", "link")
     .attr("d", link)
     .attr("fill", "none")
     .attr("stroke",options.strokeColor)
     .attr("stroke-width",options.strokeWidth);

treeLinks.data(links)
.enter()
.append("svg:path")
.attr("class", "link")
.attr("d", link)
.attr("fill", "none")
.attr("stroke",options.strokeColor)
.attr("stroke-width",options.strokeWidth);

 /*
     Nodes as
     <g class="node">
         <circle class="node-dot" />
         <text />
     </g>
  */

  // update nodes
 var nodeGroup = layoutRoot.selectAll("g.node").data(nodes)
 .style("fill", function(d){
   var nodeColor = 'black';

     if(d.qOpts){
         switch(d.qOpts.type){
             case "text":
                 nodeColor = "red";
                 break;
             case "combo":
                 nodeColor = "green";
                 break;
             default:
                 return nodeColor;
         }
     }

     console.debug(nodeColor);
     return nodeColor;
 });

// insert new nodes
 nodeGroup
     .enter()
     .append("svg:g")
     .attr("class", "node")
     .style("fill", function(d){
       var nodeColor = 'black';

         if(d.qOpts){
             switch(d.qOpts.type){
                 case "text":
                     nodeColor = "red";
                     break;
                 case "combo":
                     nodeColor = "green";
                     break;
                 default:
                     return nodeColor;
             }
         }

         return nodeColor;
     })
     .attr("transform", function(d)
     {
         return "translate(" + d.x + "," + d.y + ")";
     })
     .each(function(d,i){
       var domNode = $(this);
       domNode
        .attr("data-guid",d.id)
        .attr("data-noteOpts",d.depth)
        .attr("data-noteCoords",{x: d.x,y:d.y});
       var dataOpts = d.qOpts;
       for (var key in dataOpts) {
         if (dataOpts.hasOwnProperty(key)) {
           domNode.attr("data-"+key,dataOpts[key]);
         }
       }

       return true;
     })
     .on("mouseover",function(d){
       $(this).find('text').show();
     })
     .on("mouseout",function(d){
       $(this).find('text').hide();
     })
     .on("click",function(d){
       var out = '';
       for (var key in d) {
         if (d.hasOwnProperty(key)) {
           out += '<p><strong>'+key+':</strong> '+d[key]+'</p>';
         }
       }
       $('.nodeConfig').html(out);
     })
     .on("contextmenu",function(d){
       d3.event.preventDefault();
       $('.qtypes').show().find('a.qtype').data('source',d.id);
     });

 nodeGroup.append("svg:circle")
     .attr("class", "node-dot")
     .attr("r", options.nodeRadius);

 nodeGroup.append("svg:text")
     .attr("text-anchor", function(d)
     {
         return d.children ? "end" : "start";
     })
     .attr("dx", function(d)
     {
         var gap = 2 * options.nodeRadius;
         return d.children ? -gap : gap;
     })
     .attr("dy", options.labelOffset)
     .text(function(d)
     {
         return d.name;
     });

     // hide all text elements initially
     $(containerName+' svg g.node').find('text').hide();

  }

  $('.qtypes').hide();
  update(treeData);

  $('.qtype').click(function(){

    update({
        name: "Question 1",
        id: 'guid-1',
        children: [
            {
                name: "Question 2",
                id: 'guid-2',
                qOpts: {
                    type: "text"
                },
                children: [
                    {
                      name: "Question 3",
                      id: 'guid-3',
                      qOpts: {
                        type: "combo"
                      }
                    },
                    {
                      name: "Question 4",
                      id: 'guid-4',
                      children: [
                        {
                          name: "Question 5",
                          id: 'guid-5',
                          qOpts: {
                            type: "combo"
                          }
                        }
                      ]
                    }
                ]
            }
        ]
    });
  });


  $('.toXML').click(function(){
    var doc = new XMLHttpRequest();
    console.debug(objToXml(treeData,doc));
    $('.treeXML .xml').html(objToXml(treeData,doc));
  });

});


/*******************************************
* Yariv de Botton ydb@yariv-debotton.com *
* 2012 *
*******************************************/

/**
* This recursive function takes object, like json object
* and makes an xml out of it
* @param o The object
* @param doc An xml document, for creating xml nodes
* @returns on object with the nodes
*/
var objToXml = function(o,doc){
var e = {}; // object to be returned

// Iterating through the object
for(var x in o)if(o.hasOwnProperty(x)){

// Child nodes or the nodes themselves
var childs = {};

switch(typeof o[x]){

// if the subobject is an object (or array) recurse
case "object":{
childs = objToXml(o[x],doc);
}break;

// if it is scalar, make a text node as the single element of childs
default:{
childs[x] = doc.createTextNode(o[x]);
}break;
}

// assoiciative arrays will create nodes and append the childs in them
// whereas arrays will just accumulate the nodes
if(isNaN(x)){ // object (associative array)
e[x] = doc.createElement(x); // create a node
for(var c in childs)if(childs.hasOwnProperty(c)){
e[x].appendChild(childs[c]); // append the node
}
}else{ // regular (numeric keys) array
for(var c in childs)if(childs.hasOwnProperty(c)){
e[x + "[" + c + "]"] = childs[c]; // just assign the node
}
}
}
return e;
}
