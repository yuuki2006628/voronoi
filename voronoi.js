var width = window.innerWidth,
    height = window.innerHeight,
    v_points = [],
    canvas = document.getElementById('canvas'),
    context = canvas.getContext( "2d" ),
    voronoi,
    diagram,
    v_size = {
      xl:0,
      xr:width,
      yt:0,
      yb:height
    };

var MAX_POINT = 40;

init();

function init(){
  canvas.width = width;
  canvas.height = height;
  console.log(width,height);
  voronoi = new Voronoi();
  var sites = [];
  for (var i = 0; i < MAX_POINT; i++) {
    v_points[i] = new VoroPosition();
    sites[i] = {
      x:v_points[i].x,
      y:v_points[i].y
    };
  };
  diagram = voronoi.compute(sites,v_size);
  drawVoronoi()
  animation();
}


function VoroPosition(){
  this.x = Math.random()*width;
  this.y = Math.random()*height;
  this.vx = 5*Math.random()-2.5;
  this.vy = 5*Math.random()-2.5;
  var h = 0;
  this.color = function(){
    var s  = 100;
    var l = 50;
    h = (h+0.1)%360;
    var hsl = "hsl(" + h + "," + s + "%," + l + "%)";
    return hsl;
  }
  this.update = function(){
    var vx = this.vx,
        vy = this.vy;
    if(this.x < 100 || this.x > width-100){
      vx = 2*Math.random()-1;
      vy = 2*Math.random()-1;
      this.x = width/2;
      this.y = height/2;
    }
    if (this.y < 100 || this.y> height-100){
      vx = 2*Math.random()-1;
      vy = 2*Math.random()-1;
      this.x = width/2;
      this.y = height/2;
    }
    
    this.vx = vx;
    this.vy = vy;
    this.x += vx;
    this.y += vy;
  }
}


var _animation;

function animation(){
  _animation = requestAnimationFrame(animation);

  var sites = [];
  var vsize = {

  }
  for (var i = 0; i < v_points.length; i++) {
    v_points[i].update();
    sites[i] = {
      x:v_points[i].x,
      y:v_points[i].y
    };
  };
  diagram = voronoi.compute(sites,v_size);
  context.clearRect(0,0,width,height); 
  drawVoronoi();
  
}


function drawVoronoi(){
  //draw curve
  var new_cells = [];
  var cell_id, halfedge_id;
  var cellslen = diagram.cells.length;
  for(cell_id = 0; cell_id < cellslen; cell_id++)
  {
    var new_cell = [];
    var cell = diagram.cells[cell_id];
    var halfedgelen = cell.halfedges.length;
    for(halfedge_id = 0; halfedge_id < halfedgelen; halfedge_id++)
    {
      //current p1,p2
      var p1 = cell.halfedges[halfedge_id].edge.va;
      var p2 = cell.halfedges[halfedge_id].edge.vb;
      
      //next or back p1,p2
      var np1 = (halfedge_id == 0) ? cell.halfedges[halfedge_id+1].edge.va : cell.halfedges[halfedge_id-1].edge.va;
      var np2 = (halfedge_id == 0) ? cell.halfedges[halfedge_id+1].edge.vb : cell.halfedges[halfedge_id-1].edge.vb;
      
      //
      var tmp_p = (halfedge_id == 0) ? (p1 == np1 || p1 == np2) ? p2 : p1
                       : (p1 == np1 || p1 == np2) ? p1 : p2;
                          
      //smallize
      var new_p = {};
      new_p.x = tmp_p.x + (cell.site.x - tmp_p.x) * 0.2;
      new_p.y = tmp_p.y + (cell.site.y - tmp_p.y) * 0.2;
  
      //update
      new_cell.push(new_p);
    }
    
    //update
    new_cells.push(new_cell);
  }
  
  
  var new_cellleng = new_cells.length;
  for(cell_id = 0; cell_id < cellslen; cell_id++)
  {
    //begin
    context.beginPath();
    
    var new_cell = new_cells[cell_id];
    var edge_len = new_cell.length;
    for(edge_id = 0; edge_id < edge_len; edge_id++)
    {

      if(edge_id == 0)
      {

        context.moveTo( (new_cell[edge_id].x+new_cell[edge_len-1].x)*0.5, 
              (new_cell[edge_id].y+new_cell[edge_len-1].y)*0.5);
        
        context.quadraticCurveTo(new_cell[edge_id].x, new_cell[edge_id].y, 
                   (new_cell[edge_id].x+new_cell[edge_id+1].x)*0.5,
                   (new_cell[edge_id].y+new_cell[edge_id+1].y)*0.5);
      }
      else
      {
        context.quadraticCurveTo(new_cell[edge_id].x, new_cell[edge_id].y, 
                   (new_cell[edge_id].x+new_cell[(edge_id+1)%edge_len].x)*0.5,
                   (new_cell[edge_id].y+new_cell[(edge_id+1)%edge_len].y)*0.5);
      }
    }
    context.fillStyle = v_points[cell_id].color();
    console.log(v_points[cell_id].color());
    context.closePath();
    context.fill();
  }
}



