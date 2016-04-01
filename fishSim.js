var expanded=0,playing=1;
var w=window.innerWidth,h=window.innerHeight;
var innerRads=[1,1,1,1.06,5,1.06,1,1];
var fishPos,fishVel,checkNeigh,radii=[36,18],fCounter;
var fishNo=300,fishNoTmp=300;
var speedLim;
var xPos,yPos;
console.log("top kek");
var forcePlay=1;
if (localStorage.getItem("force")!=null){
  forcePlay=localStorage.getItem("force");
}

function setFish(){
  fishPos=[];
  fishVel=[];
  checkNeigh=[];
  fCounter=[];
  for (i=0;i<fishNo;i++){
    fishPos.push(Math.random()*w,Math.random()*h);
    fishVel.push(Math.random()*10+2,Math.random()*10+2);
    checkNeigh.push(0);
    fCounter.push(1);
  }
  speedLim=document.getElementById("drag").value;
}

function refreshSlide(){
  fishNoTmp=document.getElementById("slider").value;
  document.getElementById("sliderText").innerHTML="<l>Fish:</l> "+fishNoTmp+"";
}

function restart(){
  fishNo=fishNoTmp;
  playing=1;
  document.getElementById("song").currentTime=0;
  document.getElementById("song").play();
  setFish();
}

function exp(){
  if (expanded==1){
    document.getElementById("menu").style.left="-300px";
    document.getElementById("expando").style.height="50px";
    document.getElementById("expando").style.borderRadius="0 0 20px 0";
    document.getElementById("expando").innerHTML="⟩";
    document.getElementById("expando").title="open settings";
    document.getElementById("fishCanvas").style.WebkitFilter="blur(0px)";
    document.getElementById("fishCanvas").style.MozFilter="blur(0px)";
    expanded=0;
  }else{
    document.getElementById("menu").style.left="0";
    document.getElementById("expando").style.height="100%";
    document.getElementById("expando").style.borderRadius="0";
    document.getElementById("expando").innerHTML="⟨";
    document.getElementById("expando").title="close settings";
    document.getElementById("fishCanvas").style.WebkitFilter="blur(5px)";
    document.getElementById("fishCanvas").style.MozFilter="blur(5px)";
    expanded=1;
  }
  
}

window.onresize = function(event) {
  resize();
};

function mouseOver(){
  xPos=event.clientX;
  yPos=event.clientY;
  if (expanded==1&&xPos<330){xPos=-100;}
}

function resize(){
  w=window.innerWidth;
  h=window.innerHeight;
  document.getElementById("fishCanvas").width=w;
  document.getElementById("fishCanvas").height=h;
  paint();
}

function playPause(){
  if (event.clientX>30||event.clientY>50){
    if (expanded==1){
      if (event.clientX>330){exp();}
    }else{
      if (playing==0){
        playing=1;
        document.getElementById("song").play();
      }else{
        playing=0;
        document.getElementById("song").pause();
      }
    }
  }
}

function toggle(){
  forcePlay=Math.abs(forcePlay-1);
  document.getElementById("toggle").style.backgroundPosition=""+(Math.abs(forcePlay-1)*-50)+"px 0";
}

function move(){
  if (playing==1){
    /*for (i=0;i<fishNo*2;i+=2){
      fishPos[i]+=fishVel[i];
      fishPos[i+1]+=fishVel[i+1];
      if (fishPos[i]<0||fishPos[i]>w-10){
        fishVel[i]*=-1;
      }
      if (fishPos[i+1]<0||fishPos[i+1]>h-10){
        fishVel[i+1]*=-1;
      }
    }*/
    cohesion();
    adaption();
    repulsion();
    movePopulation();
    avoidStuff(xPos,yPos);
    paint();
  }
}

function movePopulation(){
  var margin=30;
  speedLim=document.getElementById("drag").value;
  
  for (n=0;n<fishNo*2;n+=2){
    fishPos[n]+=fishVel[n];
    fishPos[n+1]+=fishVel[n+1];
    applyDrag(speedLim,n);
    var acc = 0.5;
    if(fishPos[n]<=margin){
      fishVel[n]+=acc;
    }else if(fishPos[n]>=w-margin){
      fishVel[n]-=acc;
    }
    if(fishPos[n+1]<=margin){
      fishVel[n+1]+=acc;
    }else if(fishPos[n+1]>=h-margin){
      fishVel[n+1]-=acc;
    }
      surge(n/2);
    }
}

function surge(no){
  if (Math.floor(Math.random()*20)==0){
    fCounter[no]=Math.floor(Math.random()*3+7);
  }
  if (fCounter[no]>1){
    fCounter[no]--;
  }
}

function applyDrag(speedLim,no){
    var speed=Math.hypot(fishVel[no],fishVel[no+1]);
    if(speed > speedLim){
        var c = 0.1;
        fishVel[no+1] -= speed*c*fishVel[no+1];
        fishVel[no] -= speed*c*fishVel[no];
    }
}


function cohesion (){
    var rSquare = radii[0]*radii[0];
    var xDist, yDist;
    for(a=0;a<fishNo*2;a+=2){
        var xMean = 0, yMean = 0;    //The average of x- and y-positions.
        var count = 0;
        for(b=0;b<fishNo*2;b+=2){
            if(a!=b){
                xDist=fishPos[a]-fishPos[b];
                yDist=fishPos[a+1]-fishPos[b+1];
                var distSquared=xDist*xDist+yDist*yDist;
                if(distSquared<=rSquare){
                    count++
                    xMean+=fishPos[b];
                    yMean+=fishPos[b+1];
                }
            }
        }
        if(count>0){  //If at least one boid is within the fish's neighbourhood, the algorithm proceeds.
            var skillz=document.getElementById("cohesion").value;
            xMean/=count;
            yMean/=count;
            fishVel[a]+=(xMean-fishPos[a])*skillz/300*fCounter[a/2];
            //fish[a].dx += fish[a].counter * fish[a].dx;
            fishVel[a+1]+=(yMean-fishPos[a+1])*skillz/300*fCounter[a/2];
            //fish[a].dy += fish[a].dy * fish[a].counter;
            checkNeigh[a/2] = 0;
        }else{
            checkNeigh[a/2] = 1;
        }
    }
}


function adaption (){
    var rSquare = (radii[0]-8)*(radii[0]-8);
    for(a=0;a<fishNo*2;a+=2){
        if (checkNeigh[a/2]==0){
            var xDist, yDist, dxMean = 0, dyMean = 0;//Same as the 'cohesion' algorithm, but with velocity instead of position.
            var fishCount = 0;
            for(b=0;b<fishNo*2;b+=2){
                if(a!=b){
                    xDist = fishPos[a]-fishPos[b];
                    yDist = fishPos[a+1]-fishPos[b+1];
                    var distSquared = xDist*xDist + yDist*yDist;
                    if(distSquared <= rSquare){
                        fishCount++;
                        dxMean += fishVel[b];
                        dyMean += fishVel[b+1];
                    }
                }
            }
            if(fishCount > 0){
                var skillz = document.getElementById("adaption").value;
                dxMean /= fishCount;
                dyMean /= fishCount;
                fishVel[a] += dxMean/25*skillz*fCounter[a/2];
                fishVel[a+1] += dyMean/25*skillz*fCounter[a/2];
            }
        }
    }
}


function repulsion (){
    var xDist, yDist, rSquare=radii[1]*radii[1];
    for(a=0;a<fishNo*2-2;a+=2){
        if(checkNeigh[a/2]==0){
            for(b=a+2;b<fishNo*2;b+=2){ //Check each fish [b] in relation to the main fish [a].
                xDist = fishPos[a]-fishPos[b];
                yDist = fishPos[a+1]-fishPos[b+1];
                var distSquared = xDist*xDist + yDist*yDist;
                if(distSquared<=rSquare&&distSquared!=0){  //Checks if a fish is within the neighbourhood of an another fish. ('a' with respect to 'b'.)
                    var skillz = document.getElementById("repulsion").value, sinA, cosA, dist = Math.sqrt(distSquared);
                    sinA = yDist/dist;
                    cosA = xDist/dist;

                    var acc = Math.pow(radii[1]-dist,2)*skillz*0.08;   //[Radius minus distance] squared equals the acceleration.
                    if(acc>0.12*skillz){  
                        acc=0.12*skillz;  //Limit the acceleration, the fishes can't have unlimited skillz.
                    }
                    var accX=acc*cosA, accY=acc*sinA;   //Acceleration in two dimensions
                    fishVel[a] += accX;
                    fishVel[b] -= accX;    //Aplies a repelling acceleration to the fish. [x-axis]
                    fishVel[a+1] += accY;
                    fishVel[b+1] -= accY;    //[y-axis]
                }   
            }
        }
    }
}

function avoidStuff(x,y){
    var xDist, yDist, rSquare = 56*56;
    for(a=0;a<fishNo*2;a+=2){
        xDist=fishPos[a]-x;
        yDist=fishPos[a+1]-y;
        var distSquared=xDist*xDist+yDist*yDist;
        if(distSquared<=rSquare){
            var skillz=document.getElementById("repulsion").value, sinA, cosA, dist = Math.sqrt(distSquared);
            sinA = yDist/dist;
            cosA = xDist/dist;

            var acc = Math.pow(radii[a%2+1]-dist,2)*skillz*0.08;   //[Radius minus distance] squared equals the acceleration.
            if(acc>skillz){  
                acc=skillz;  //Limit the acceleration, the fishes can't have unlimited skillz.
            }
            var accX = acc*cosA, accY=acc*sinA;   //Acceleration in two dimensions
            fishVel[a]+=accX;
            fishVel[a+1]+=accY;
        }
    }
}





function paint(){
  var ctx = document.getElementById("fishCanvas").getContext("2d");
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#222";
  var size=3;
  var rotation=30/180*Math.PI;
  for(i=0;i<fishNo*2;i+=2){
    var angle=Math.atan(fishVel[i+1]/fishVel[i]);
    if (fishVel[i]<0){angle+=Math.PI;}
    angle-=Math.PI/8;
    //var angle=Math.acos(fishVel[i]/Math.hypot(fishVel[i],fishVel[i+1]));
    ctx.beginPath();
    ctx.moveTo(fishPos[i]+Math.cos(rotation+angle)*size,fishPos[i+1]+Math.sin(rotation+angle)*size);
    var count=1;
    for (n=rotation+1/4*Math.PI;n<=rotation+2*Math.PI;n+=1/4*Math.PI){
      ctx.lineTo(fishPos[i]+Math.cos(n+angle)*size*innerRads[count],fishPos[i+1]+Math.sin(n+angle)*size*innerRads[count])
      count++;
    }
    ctx.fill();
    
    //ctx.fillRect(fishPos[i],fishPos[i+1],10,10);
    /*ctx.beginPath();
    var angle=Math.atan(fishVel[i+1]/fishVel[i]);
    ctx.moveTo(fishPos[i]+Math.cos(angle)*10,fishPos[i+1]+Math.sin(angle)*10);
    ctx.lineTo(fishPos[i]+Math.cos(angle+Math.PI)*10,fishPos[i+1]+Math.sin(angle+Math.PI)*10)
    ctx.stroke();*/
    /*ctx.beginPath();
    ctx.arc(fishPos[i],fishPos[i+1],5,0,2*Math.PI);*/
  } 
}

setTimeout(startupstuff,5000);

function startupstuff(){
  setFish();
  document.getElementById("song").play();
  document.getElementById("overlay").style.display="none";
  document.getElementById("toggle").style.backgroundPosition=""+(Math.abs(forcePlay-1)*-50)+"px 0";
  setInterval(move,50);
}
