(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const So="169",Ah=0,Zo=1,Ch=2,Ec=1,Rh=2,Cn=3,Un=0,De=1,Fe=2,Ln=0,Bi=1,Oe=2,Qo=3,tl=4,Ph=5,oi=100,Lh=101,Dh=102,Ih=103,Uh=104,Nh=200,Fh=201,Oh=202,Bh=203,Ta=204,Aa=205,kh=206,zh=207,Vh=208,Gh=209,Hh=210,Wh=211,Xh=212,qh=213,Yh=214,Ca=0,Ra=1,Pa=2,Gi=3,La=4,Da=5,Ia=6,Ua=7,bc=0,Kh=1,$h=2,Yn=0,Tc=1,Ac=2,Cc=3,wo=4,jh=5,Rc=6,Pc=7,Lc=300,Hi=301,Wi=302,Na=303,Fa=304,Rr=306,Xi=1e3,qn=1001,Oa=1002,Ye=1003,Jh=1004,Is=1005,tn=1006,Br=1007,ci=1008,Nn=1009,Dc=1010,Ic=1011,Ss=1012,Eo=1013,hi=1014,_n=1015,Dn=1016,bo=1017,To=1018,qi=1020,Uc=35902,Nc=1021,Fc=1022,fn=1023,Oc=1024,Bc=1025,ki=1026,Yi=1027,Ao=1028,Co=1029,kc=1030,Ro=1031,Po=1033,ur=33776,dr=33777,fr=33778,pr=33779,Ba=35840,ka=35841,za=35842,Va=35843,Ga=36196,Ha=37492,Wa=37496,Xa=37808,qa=37809,Ya=37810,Ka=37811,$a=37812,ja=37813,Ja=37814,Za=37815,Qa=37816,to=37817,eo=37818,no=37819,io=37820,so=37821,mr=36492,ro=36494,ao=36495,zc=36283,oo=36284,lo=36285,co=36286,Zh=3200,Qh=3201,Vc=0,tu=1,Xn="",Xe="srgb",$n="srgb-linear",Lo="display-p3",Pr="display-p3-linear",xr="linear",le="srgb",yr="rec709",Mr="p3",mi=7680,el=519,eu=512,nu=513,iu=514,Gc=515,su=516,ru=517,au=518,ou=519,Sr=35044,nl="300 es",Pn=2e3,wr=2001;class Ji{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const Ie=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],kr=Math.PI/180,ho=180/Math.PI;function In(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ie[i&255]+Ie[i>>8&255]+Ie[i>>16&255]+Ie[i>>24&255]+"-"+Ie[t&255]+Ie[t>>8&255]+"-"+Ie[t>>16&15|64]+Ie[t>>24&255]+"-"+Ie[e&63|128]+Ie[e>>8&255]+"-"+Ie[e>>16&255]+Ie[e>>24&255]+Ie[n&255]+Ie[n>>8&255]+Ie[n>>16&255]+Ie[n>>24&255]).toLowerCase()}function Ne(i,t,e){return Math.max(t,Math.min(e,i))}function lu(i,t){return(i%t+t)%t}function zr(i,t,e){return(1-e)*i+e*t}function vn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function se(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Q{constructor(t=0,e=0){Q.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ne(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ht{constructor(t,e,n,s,r,a,o,l,c){Ht.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],_=s[0],f=s[3],m=s[6],M=s[1],x=s[4],y=s[7],L=s[2],R=s[5],b=s[8];return r[0]=a*_+o*M+l*L,r[3]=a*f+o*x+l*R,r[6]=a*m+o*y+l*b,r[1]=c*_+h*M+u*L,r[4]=c*f+h*x+u*R,r[7]=c*m+h*y+u*b,r[2]=d*_+p*M+g*L,r[5]=d*f+p*x+g*R,r[8]=d*m+p*y+g*b,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,d=o*l-h*r,p=c*r-a*l,g=e*u+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=u*_,t[1]=(s*c-h*n)*_,t[2]=(o*n-s*a)*_,t[3]=d*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-o*e)*_,t[6]=p*_,t[7]=(n*l-c*e)*_,t[8]=(a*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Vr.makeScale(t,e)),this}rotate(t){return this.premultiply(Vr.makeRotation(-t)),this}translate(t,e){return this.premultiply(Vr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Vr=new Ht;function Hc(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Er(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function cu(){const i=Er("canvas");return i.style.display="block",i}const il={};function gr(i){i in il||(il[i]=!0,console.warn(i))}function hu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function uu(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function du(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const sl=new Ht().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),rl=new Ht().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),es={[$n]:{transfer:xr,primaries:yr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[Xe]:{transfer:le,primaries:yr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Pr]:{transfer:xr,primaries:Mr,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(rl),fromReference:i=>i.applyMatrix3(sl)},[Lo]:{transfer:le,primaries:Mr,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(rl),fromReference:i=>i.applyMatrix3(sl).convertLinearToSRGB()}},fu=new Set([$n,Pr]),Jt={enabled:!0,_workingColorSpace:$n,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!fu.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;const n=es[t].toReference,s=es[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return es[i].primaries},getTransfer:function(i){return i===Xn?xr:es[i].transfer},getLuminanceCoefficients:function(i,t=this._workingColorSpace){return i.fromArray(es[t].luminanceCoefficients)}};function zi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Gr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let gi;class pu{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{gi===void 0&&(gi=Er("canvas")),gi.width=t.width,gi.height=t.height;const n=gi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=gi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Er("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=zi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(zi(e[n]/255)*255):e[n]=zi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let mu=0;class Wc{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:mu++}),this.uuid=In(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Hr(s[a].image)):r.push(Hr(s[a]))}else r=Hr(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Hr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?pu.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let gu=0;class ke extends Ji{constructor(t=ke.DEFAULT_IMAGE,e=ke.DEFAULT_MAPPING,n=qn,s=qn,r=tn,a=ci,o=fn,l=Nn,c=ke.DEFAULT_ANISOTROPY,h=Xn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:gu++}),this.uuid=In(),this.name="",this.source=new Wc(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Q(0,0),this.repeat=new Q(1,1),this.center=new Q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ht,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Lc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Xi:t.x=t.x-Math.floor(t.x);break;case qn:t.x=t.x<0?0:1;break;case Oa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Xi:t.y=t.y-Math.floor(t.y);break;case qn:t.y=t.y<0?0:1;break;case Oa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}ke.DEFAULT_IMAGE=null;ke.DEFAULT_MAPPING=Lc;ke.DEFAULT_ANISOTROPY=1;class re{constructor(t=0,e=0,n=0,s=1){re.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],g=l[9],_=l[2],f=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-f)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+f)<.1&&Math.abs(c+p+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const x=(c+1)/2,y=(p+1)/2,L=(m+1)/2,R=(h+d)/4,b=(u+_)/4,P=(g+f)/4;return x>y&&x>L?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=R/n,r=b/n):y>L?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=R/s,r=P/s):L<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),n=b/r,s=P/r),this.set(n,s,r,e),this}let M=Math.sqrt((f-g)*(f-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(M)<.001&&(M=1),this.x=(f-g)/M,this.y=(u-_)/M,this.z=(d-h)/M,this.w=Math.acos((c+p+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class vu extends Ji{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new re(0,0,t,e),this.scissorTest=!1,this.viewport=new re(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:tn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new ke(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Wc(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class pn extends vu{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Xc extends ke{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ye,this.minFilter=Ye,this.wrapR=qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class _u extends ke{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ye,this.minFilter=Ye,this.wrapR=qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class rn{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const d=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=d,t[e+1]=p,t[e+2]=g,t[e+3]=_;return}if(u!==_||l!==d||c!==p||h!==g){let f=1-o;const m=l*d+c*p+h*g+u*_,M=m>=0?1:-1,x=1-m*m;if(x>Number.EPSILON){const L=Math.sqrt(x),R=Math.atan2(L,m*M);f=Math.sin(f*R)/L,o=Math.sin(o*R)/L}const y=o*M;if(l=l*f+d*y,c=c*f+p*y,h=h*f+g*y,u=u*f+_*y,f===1-o){const L=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=L,c*=L,h*=L,u*=L}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],d=r[a+1],p=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*p-c*d,t[e+1]=l*g+h*d+c*u-o*p,t[e+2]=c*g+h*p+o*d-l*u,t[e+3]=h*g-o*u-l*d-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),d=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"YZX":this._x=d*h*u+c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u-d*p*g;break;case"XZY":this._x=d*h*u-c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+o+u;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){const p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){const p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ne(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,d=Math.sin(e*h)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class T{constructor(t=0,e=0,n=0){T.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(al.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(al.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Wr.copy(this).projectOnVector(t),this.sub(Wr)}reflect(t){return this.sub(Wr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ne(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Wr=new T,al=new rn;class jn{constructor(t=new T(1/0,1/0,1/0),e=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ln.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ln.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=ln.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,ln):ln.fromBufferAttribute(r,a),ln.applyMatrix4(t.matrixWorld),this.expandByPoint(ln);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Us.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Us.copy(n.boundingBox)),Us.applyMatrix4(t.matrixWorld),this.union(Us)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ln),ln.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ns),Ns.subVectors(this.max,ns),vi.subVectors(t.a,ns),_i.subVectors(t.b,ns),xi.subVectors(t.c,ns),Bn.subVectors(_i,vi),kn.subVectors(xi,_i),Zn.subVectors(vi,xi);let e=[0,-Bn.z,Bn.y,0,-kn.z,kn.y,0,-Zn.z,Zn.y,Bn.z,0,-Bn.x,kn.z,0,-kn.x,Zn.z,0,-Zn.x,-Bn.y,Bn.x,0,-kn.y,kn.x,0,-Zn.y,Zn.x,0];return!Xr(e,vi,_i,xi,Ns)||(e=[1,0,0,0,1,0,0,0,1],!Xr(e,vi,_i,xi,Ns))?!1:(Fs.crossVectors(Bn,kn),e=[Fs.x,Fs.y,Fs.z],Xr(e,vi,_i,xi,Ns))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ln).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ln).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Sn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Sn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Sn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Sn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Sn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Sn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Sn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Sn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Sn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Sn=[new T,new T,new T,new T,new T,new T,new T,new T],ln=new T,Us=new jn,vi=new T,_i=new T,xi=new T,Bn=new T,kn=new T,Zn=new T,ns=new T,Ns=new T,Fs=new T,Qn=new T;function Xr(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Qn.fromArray(i,r);const o=s.x*Math.abs(Qn.x)+s.y*Math.abs(Qn.y)+s.z*Math.abs(Qn.z),l=t.dot(Qn),c=e.dot(Qn),h=n.dot(Qn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const xu=new jn,is=new T,qr=new T;class Zi{constructor(t=new T,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):xu.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;is.subVectors(t,this.center);const e=is.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(is,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(qr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(is.copy(t.center).add(qr)),this.expandByPoint(is.copy(t.center).sub(qr))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const wn=new T,Yr=new T,Os=new T,zn=new T,Kr=new T,Bs=new T,$r=new T;class qc{constructor(t=new T,e=new T(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,wn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=wn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(wn.copy(this.origin).addScaledVector(this.direction,e),wn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Yr.copy(t).add(e).multiplyScalar(.5),Os.copy(e).sub(t).normalize(),zn.copy(this.origin).sub(Yr);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Os),o=zn.dot(this.direction),l=-zn.dot(Os),c=zn.lengthSq(),h=Math.abs(1-a*a);let u,d,p,g;if(h>0)if(u=a*l-o,d=a*o-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const _=1/h;u*=_,d*=_,p=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Yr).addScaledVector(Os,d),p}intersectSphere(t,e){wn.subVectors(t.center,this.origin);const n=wn.dot(this.direction),s=wn.dot(wn)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,a=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,a=(t.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(o=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,wn)!==null}intersectTriangle(t,e,n,s,r){Kr.subVectors(e,t),Bs.subVectors(n,t),$r.crossVectors(Kr,Bs);let a=this.direction.dot($r),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;zn.subVectors(this.origin,t);const l=o*this.direction.dot(Bs.crossVectors(zn,Bs));if(l<0)return null;const c=o*this.direction.dot(Kr.cross(zn));if(c<0||l+c>a)return null;const h=-o*zn.dot($r);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ne{constructor(t,e,n,s,r,a,o,l,c,h,u,d,p,g,_,f){ne.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,u,d,p,g,_,f)}set(t,e,n,s,r,a,o,l,c,h,u,d,p,g,_,f){const m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=p,m[7]=g,m[11]=_,m[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ne().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/yi.setFromMatrixColumn(t,0).length(),r=1/yi.setFromMatrixColumn(t,1).length(),a=1/yi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const d=a*h,p=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=p+g*c,e[5]=d-_*c,e[9]=-o*l,e[2]=_-d*c,e[6]=g+p*c,e[10]=a*l}else if(t.order==="YXZ"){const d=l*h,p=l*u,g=c*h,_=c*u;e[0]=d+_*o,e[4]=g*o-p,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=p*o-g,e[6]=_+d*o,e[10]=a*l}else if(t.order==="ZXY"){const d=l*h,p=l*u,g=c*h,_=c*u;e[0]=d-_*o,e[4]=-a*u,e[8]=g+p*o,e[1]=p+g*o,e[5]=a*h,e[9]=_-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const d=a*h,p=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=g*c-p,e[8]=d*c+_,e[1]=l*u,e[5]=_*c+d,e[9]=p*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const d=a*l,p=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=_-d*u,e[8]=g*u+p,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=p*u+g,e[10]=d-_*u}else if(t.order==="XZY"){const d=a*l,p=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+_,e[5]=a*h,e[9]=p*u-g,e[2]=g*u-p,e[6]=o*h,e[10]=_*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(yu,t,Mu)}lookAt(t,e,n){const s=this.elements;return Je.subVectors(t,e),Je.lengthSq()===0&&(Je.z=1),Je.normalize(),Vn.crossVectors(n,Je),Vn.lengthSq()===0&&(Math.abs(n.z)===1?Je.x+=1e-4:Je.z+=1e-4,Je.normalize(),Vn.crossVectors(n,Je)),Vn.normalize(),ks.crossVectors(Je,Vn),s[0]=Vn.x,s[4]=ks.x,s[8]=Je.x,s[1]=Vn.y,s[5]=ks.y,s[9]=Je.y,s[2]=Vn.z,s[6]=ks.z,s[10]=Je.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],_=n[6],f=n[10],m=n[14],M=n[3],x=n[7],y=n[11],L=n[15],R=s[0],b=s[4],P=s[8],N=s[12],v=s[1],w=s[5],O=s[9],B=s[13],k=s[2],X=s[6],z=s[10],j=s[14],H=s[3],at=s[7],ft=s[11],pt=s[15];return r[0]=a*R+o*v+l*k+c*H,r[4]=a*b+o*w+l*X+c*at,r[8]=a*P+o*O+l*z+c*ft,r[12]=a*N+o*B+l*j+c*pt,r[1]=h*R+u*v+d*k+p*H,r[5]=h*b+u*w+d*X+p*at,r[9]=h*P+u*O+d*z+p*ft,r[13]=h*N+u*B+d*j+p*pt,r[2]=g*R+_*v+f*k+m*H,r[6]=g*b+_*w+f*X+m*at,r[10]=g*P+_*O+f*z+m*ft,r[14]=g*N+_*B+f*j+m*pt,r[3]=M*R+x*v+y*k+L*H,r[7]=M*b+x*w+y*X+L*at,r[11]=M*P+x*O+y*z+L*ft,r[15]=M*N+x*B+y*j+L*pt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],p=t[14],g=t[3],_=t[7],f=t[11],m=t[15];return g*(+r*l*u-s*c*u-r*o*d+n*c*d+s*o*p-n*l*p)+_*(+e*l*p-e*c*d+r*a*d-s*a*p+s*c*h-r*l*h)+f*(+e*c*u-e*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+m*(-s*o*h-e*l*u+e*o*d+s*a*u-n*a*d+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],p=t[11],g=t[12],_=t[13],f=t[14],m=t[15],M=u*f*c-_*d*c+_*l*p-o*f*p-u*l*m+o*d*m,x=g*d*c-h*f*c-g*l*p+a*f*p+h*l*m-a*d*m,y=h*_*c-g*u*c+g*o*p-a*_*p-h*o*m+a*u*m,L=g*u*l-h*_*l-g*o*d+a*_*d+h*o*f-a*u*f,R=e*M+n*x+s*y+r*L;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const b=1/R;return t[0]=M*b,t[1]=(_*d*r-u*f*r-_*s*p+n*f*p+u*s*m-n*d*m)*b,t[2]=(o*f*r-_*l*r+_*s*c-n*f*c-o*s*m+n*l*m)*b,t[3]=(u*l*r-o*d*r-u*s*c+n*d*c+o*s*p-n*l*p)*b,t[4]=x*b,t[5]=(h*f*r-g*d*r+g*s*p-e*f*p-h*s*m+e*d*m)*b,t[6]=(g*l*r-a*f*r-g*s*c+e*f*c+a*s*m-e*l*m)*b,t[7]=(a*d*r-h*l*r+h*s*c-e*d*c-a*s*p+e*l*p)*b,t[8]=y*b,t[9]=(g*u*r-h*_*r-g*n*p+e*_*p+h*n*m-e*u*m)*b,t[10]=(a*_*r-g*o*r+g*n*c-e*_*c-a*n*m+e*o*m)*b,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*p-e*o*p)*b,t[12]=L*b,t[13]=(h*_*s-g*u*s+g*n*d-e*_*d-h*n*f+e*u*f)*b,t[14]=(g*o*s-a*_*s-g*n*l+e*_*l+a*n*f-e*o*f)*b,t[15]=(a*u*s-h*o*s+h*n*l-e*u*l-a*n*d+e*o*d)*b,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,d=r*c,p=r*h,g=r*u,_=a*h,f=a*u,m=o*u,M=l*c,x=l*h,y=l*u,L=n.x,R=n.y,b=n.z;return s[0]=(1-(_+m))*L,s[1]=(p+y)*L,s[2]=(g-x)*L,s[3]=0,s[4]=(p-y)*R,s[5]=(1-(d+m))*R,s[6]=(f+M)*R,s[7]=0,s[8]=(g+x)*b,s[9]=(f-M)*b,s[10]=(1-(d+_))*b,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=yi.set(s[0],s[1],s[2]).length();const a=yi.set(s[4],s[5],s[6]).length(),o=yi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],cn.copy(this);const c=1/r,h=1/a,u=1/o;return cn.elements[0]*=c,cn.elements[1]*=c,cn.elements[2]*=c,cn.elements[4]*=h,cn.elements[5]*=h,cn.elements[6]*=h,cn.elements[8]*=u,cn.elements[9]*=u,cn.elements[10]*=u,e.setFromRotationMatrix(cn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=Pn){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),d=(n+s)/(n-s);let p,g;if(o===Pn)p=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===wr)p=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=Pn){const l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(a-r),d=(e+t)*c,p=(n+s)*h;let g,_;if(o===Pn)g=(a+r)*u,_=-2*u;else if(o===wr)g=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const yi=new T,cn=new ne,yu=new T(0,0,0),Mu=new T(1,1,1),Vn=new T,ks=new T,Je=new T,ol=new ne,ll=new rn;class an{constructor(t=0,e=0,n=0,s=an.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Ne(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ne(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ne(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ne(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ne(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ne(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return ol.makeRotationFromQuaternion(t),this.setFromRotationMatrix(ol,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return ll.setFromEuler(this),this.setFromQuaternion(ll,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}an.DEFAULT_ORDER="XYZ";class Yc{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Su=0;const cl=new T,Mi=new rn,En=new ne,zs=new T,ss=new T,wu=new T,Eu=new rn,hl=new T(1,0,0),ul=new T(0,1,0),dl=new T(0,0,1),fl={type:"added"},bu={type:"removed"},Si={type:"childadded",child:null},jr={type:"childremoved",child:null};class Ce extends Ji{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Su++}),this.uuid=In(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ce.DEFAULT_UP.clone();const t=new T,e=new an,n=new rn,s=new T(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ne},normalMatrix:{value:new Ht}}),this.matrix=new ne,this.matrixWorld=new ne,this.matrixAutoUpdate=Ce.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ce.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Mi.setFromAxisAngle(t,e),this.quaternion.multiply(Mi),this}rotateOnWorldAxis(t,e){return Mi.setFromAxisAngle(t,e),this.quaternion.premultiply(Mi),this}rotateX(t){return this.rotateOnAxis(hl,t)}rotateY(t){return this.rotateOnAxis(ul,t)}rotateZ(t){return this.rotateOnAxis(dl,t)}translateOnAxis(t,e){return cl.copy(t).applyQuaternion(this.quaternion),this.position.add(cl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(hl,t)}translateY(t){return this.translateOnAxis(ul,t)}translateZ(t){return this.translateOnAxis(dl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(En.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?zs.copy(t):zs.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),ss.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?En.lookAt(ss,zs,this.up):En.lookAt(zs,ss,this.up),this.quaternion.setFromRotationMatrix(En),s&&(En.extractRotation(s.matrixWorld),Mi.setFromRotationMatrix(En),this.quaternion.premultiply(Mi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(fl),Si.child=t,this.dispatchEvent(Si),Si.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(bu),jr.child=t,this.dispatchEvent(jr),jr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),En.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),En.multiply(t.parent.matrixWorld)),t.applyMatrix4(En),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(fl),Si.child=t,this.dispatchEvent(Si),Si.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ss,t,wu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ss,Eu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),d=a(t.skeletons),p=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}Ce.DEFAULT_UP=new T(0,1,0);Ce.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ce.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const hn=new T,bn=new T,Jr=new T,Tn=new T,wi=new T,Ei=new T,pl=new T,Zr=new T,Qr=new T,ta=new T,ea=new re,na=new re,ia=new re;class sn{constructor(t=new T,e=new T,n=new T){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),hn.subVectors(t,e),s.cross(hn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){hn.subVectors(s,e),bn.subVectors(n,e),Jr.subVectors(t,e);const a=hn.dot(hn),o=hn.dot(bn),l=hn.dot(Jr),c=bn.dot(bn),h=bn.dot(Jr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const d=1/u,p=(c*l-o*h)*d,g=(a*h-o*l)*d;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Tn)===null?!1:Tn.x>=0&&Tn.y>=0&&Tn.x+Tn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,Tn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Tn.x),l.addScaledVector(a,Tn.y),l.addScaledVector(o,Tn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return ea.setScalar(0),na.setScalar(0),ia.setScalar(0),ea.fromBufferAttribute(t,e),na.fromBufferAttribute(t,n),ia.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(ea,r.x),a.addScaledVector(na,r.y),a.addScaledVector(ia,r.z),a}static isFrontFacing(t,e,n,s){return hn.subVectors(n,e),bn.subVectors(t,e),hn.cross(bn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return hn.subVectors(this.c,this.b),bn.subVectors(this.a,this.b),hn.cross(bn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return sn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return sn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return sn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return sn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return sn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;wi.subVectors(s,n),Ei.subVectors(r,n),Zr.subVectors(t,n);const l=wi.dot(Zr),c=Ei.dot(Zr);if(l<=0&&c<=0)return e.copy(n);Qr.subVectors(t,s);const h=wi.dot(Qr),u=Ei.dot(Qr);if(h>=0&&u<=h)return e.copy(s);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(wi,a);ta.subVectors(t,r);const p=wi.dot(ta),g=Ei.dot(ta);if(g>=0&&p<=g)return e.copy(r);const _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(Ei,o);const f=h*g-p*u;if(f<=0&&u-h>=0&&p-g>=0)return pl.subVectors(r,s),o=(u-h)/(u-h+(p-g)),e.copy(s).addScaledVector(pl,o);const m=1/(f+_+d);return a=_*m,o=d*m,e.copy(n).addScaledVector(wi,a).addScaledVector(Ei,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Kc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gn={h:0,s:0,l:0},Vs={h:0,s:0,l:0};function sa(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Ut{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Xe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Jt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Jt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Jt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Jt.workingColorSpace){if(t=lu(t,1),e=Ne(e,0,1),n=Ne(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=sa(a,r,t+1/3),this.g=sa(a,r,t),this.b=sa(a,r,t-1/3)}return Jt.toWorkingColorSpace(this,s),this}setStyle(t,e=Xe){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Xe){const n=Kc[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=zi(t.r),this.g=zi(t.g),this.b=zi(t.b),this}copyLinearToSRGB(t){return this.r=Gr(t.r),this.g=Gr(t.g),this.b=Gr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Xe){return Jt.fromWorkingColorSpace(Ue.copy(this),t),Math.round(Ne(Ue.r*255,0,255))*65536+Math.round(Ne(Ue.g*255,0,255))*256+Math.round(Ne(Ue.b*255,0,255))}getHexString(t=Xe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Jt.workingColorSpace){Jt.fromWorkingColorSpace(Ue.copy(this),e);const n=Ue.r,s=Ue.g,r=Ue.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Jt.workingColorSpace){return Jt.fromWorkingColorSpace(Ue.copy(this),e),t.r=Ue.r,t.g=Ue.g,t.b=Ue.b,t}getStyle(t=Xe){Jt.fromWorkingColorSpace(Ue.copy(this),t);const e=Ue.r,n=Ue.g,s=Ue.b;return t!==Xe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Gn),this.setHSL(Gn.h+t,Gn.s+e,Gn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Gn),t.getHSL(Vs);const n=zr(Gn.h,Vs.h,e),s=zr(Gn.s,Vs.s,e),r=zr(Gn.l,Vs.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ue=new Ut;Ut.NAMES=Kc;let Tu=0;class di extends Ji{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Tu++}),this.uuid=In(),this.name="",this.type="Material",this.blending=Bi,this.side=Un,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ta,this.blendDst=Aa,this.blendEquation=oi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ut(0,0,0),this.blendAlpha=0,this.depthFunc=Gi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=el,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=mi,this.stencilZFail=mi,this.stencilZPass=mi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Bi&&(n.blending=this.blending),this.side!==Un&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ta&&(n.blendSrc=this.blendSrc),this.blendDst!==Aa&&(n.blendDst=this.blendDst),this.blendEquation!==oi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Gi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==el&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==mi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==mi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==mi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Se extends di{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ut(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new an,this.combine=bc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const xe=new T,Gs=new Q;class Be{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Sr,this.updateRanges=[],this.gpuType=_n,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Gs.fromBufferAttribute(this,e),Gs.applyMatrix3(t),this.setXY(e,Gs.x,Gs.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.applyMatrix3(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.applyMatrix4(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.applyNormalMatrix(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)xe.fromBufferAttribute(this,e),xe.transformDirection(t),this.setXYZ(e,xe.x,xe.y,xe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=vn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=se(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=vn(e,this.array)),e}setX(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=vn(e,this.array)),e}setY(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=vn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=vn(e,this.array)),e}setW(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array),r=se(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Sr&&(t.usage=this.usage),t}}class $c extends Be{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class jc extends Be{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ie extends Be{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Au=0;const nn=new ne,ra=new Ce,bi=new T,Ze=new jn,rs=new jn,Te=new T;class we extends Ji{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Au++}),this.uuid=In(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Hc(t)?jc:$c)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ht().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return nn.makeRotationFromQuaternion(t),this.applyMatrix4(nn),this}rotateX(t){return nn.makeRotationX(t),this.applyMatrix4(nn),this}rotateY(t){return nn.makeRotationY(t),this.applyMatrix4(nn),this}rotateZ(t){return nn.makeRotationZ(t),this.applyMatrix4(nn),this}translate(t,e,n){return nn.makeTranslation(t,e,n),this.applyMatrix4(nn),this}scale(t,e,n){return nn.makeScale(t,e,n),this.applyMatrix4(nn),this}lookAt(t){return ra.lookAt(t),ra.updateMatrix(),this.applyMatrix4(ra.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bi).negate(),this.translate(bi.x,bi.y,bi.z),this}setFromPoints(t){const e=[];for(let n=0,s=t.length;n<s;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ie(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new jn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];Ze.setFromBufferAttribute(r),this.morphTargetsRelative?(Te.addVectors(this.boundingBox.min,Ze.min),this.boundingBox.expandByPoint(Te),Te.addVectors(this.boundingBox.max,Ze.max),this.boundingBox.expandByPoint(Te)):(this.boundingBox.expandByPoint(Ze.min),this.boundingBox.expandByPoint(Ze.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Zi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(t){const n=this.boundingSphere.center;if(Ze.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];rs.setFromBufferAttribute(o),this.morphTargetsRelative?(Te.addVectors(Ze.min,rs.min),Ze.expandByPoint(Te),Te.addVectors(Ze.max,rs.max),Ze.expandByPoint(Te)):(Ze.expandByPoint(rs.min),Ze.expandByPoint(rs.max))}Ze.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Te.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Te));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Te.fromBufferAttribute(o,c),l&&(bi.fromBufferAttribute(t,c),Te.add(bi)),s=Math.max(s,n.distanceToSquared(Te))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Be(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let P=0;P<n.count;P++)o[P]=new T,l[P]=new T;const c=new T,h=new T,u=new T,d=new Q,p=new Q,g=new Q,_=new T,f=new T;function m(P,N,v){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,N),u.fromBufferAttribute(n,v),d.fromBufferAttribute(r,P),p.fromBufferAttribute(r,N),g.fromBufferAttribute(r,v),h.sub(c),u.sub(c),p.sub(d),g.sub(d);const w=1/(p.x*g.y-g.x*p.y);isFinite(w)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(w),f.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(w),o[P].add(_),o[N].add(_),o[v].add(_),l[P].add(f),l[N].add(f),l[v].add(f))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let P=0,N=M.length;P<N;++P){const v=M[P],w=v.start,O=v.count;for(let B=w,k=w+O;B<k;B+=3)m(t.getX(B+0),t.getX(B+1),t.getX(B+2))}const x=new T,y=new T,L=new T,R=new T;function b(P){L.fromBufferAttribute(s,P),R.copy(L);const N=o[P];x.copy(N),x.sub(L.multiplyScalar(L.dot(N))).normalize(),y.crossVectors(R,N);const w=y.dot(l[P])<0?-1:1;a.setXYZW(P,x.x,x.y,x.z,w)}for(let P=0,N=M.length;P<N;++P){const v=M[P],w=v.start,O=v.count;for(let B=w,k=w+O;B<k;B+=3)b(t.getX(B+0)),b(t.getX(B+1)),b(t.getX(B+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Be(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const s=new T,r=new T,a=new T,o=new T,l=new T,c=new T,h=new T,u=new T;if(t)for(let d=0,p=t.count;d<p;d+=3){const g=t.getX(d+0),_=t.getX(d+1),f=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,f),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,f),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(f,c.x,c.y,c.z)}else for(let d=0,p=e.count;d<p;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Te.fromBufferAttribute(t,e),Te.normalize(),t.setXYZ(e,Te.x,Te.y,Te.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h);let p=0,g=0;for(let _=0,f=l.length;_<f;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let m=0;m<h;m++)d[g++]=c[p++]}return new Be(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new we,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const d=c[h],p=t(d,n);l.push(p)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const p=c[u];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ml=new ne,ti=new qc,Hs=new Zi,gl=new T,Ws=new T,Xs=new T,qs=new T,aa=new T,Ys=new T,vl=new T,Ks=new T;class it extends Ce{constructor(t=new we,e=new Se){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){Ys.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(aa.fromBufferAttribute(u,t),a?Ys.addScaledVector(aa,h):Ys.addScaledVector(aa.sub(e),h))}e.add(Ys)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Hs.copy(n.boundingSphere),Hs.applyMatrix4(r),ti.copy(t.ray).recast(t.near),!(Hs.containsPoint(ti.origin)===!1&&(ti.intersectSphere(Hs,gl)===null||ti.origin.distanceToSquared(gl)>(t.far-t.near)**2))&&(ml.copy(r).invert(),ti.copy(t.ray).applyMatrix4(ml),!(n.boundingBox!==null&&ti.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ti)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){const f=d[g],m=a[f.materialIndex],M=Math.max(f.start,p.start),x=Math.min(o.count,Math.min(f.start+f.count,p.start+p.count));for(let y=M,L=x;y<L;y+=3){const R=o.getX(y),b=o.getX(y+1),P=o.getX(y+2);s=$s(this,m,t,n,c,h,u,R,b,P),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=f.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let f=g,m=_;f<m;f+=3){const M=o.getX(f),x=o.getX(f+1),y=o.getX(f+2);s=$s(this,a,t,n,c,h,u,M,x,y),s&&(s.faceIndex=Math.floor(f/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){const f=d[g],m=a[f.materialIndex],M=Math.max(f.start,p.start),x=Math.min(l.count,Math.min(f.start+f.count,p.start+p.count));for(let y=M,L=x;y<L;y+=3){const R=y,b=y+1,P=y+2;s=$s(this,m,t,n,c,h,u,R,b,P),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=f.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let f=g,m=_;f<m;f+=3){const M=f,x=f+1,y=f+2;s=$s(this,a,t,n,c,h,u,M,x,y),s&&(s.faceIndex=Math.floor(f/3),e.push(s))}}}}function Cu(i,t,e,n,s,r,a,o){let l;if(t.side===De?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===Un,o),l===null)return null;Ks.copy(o),Ks.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Ks);return c<e.near||c>e.far?null:{distance:c,point:Ks.clone(),object:i}}function $s(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,Ws),i.getVertexPosition(l,Xs),i.getVertexPosition(c,qs);const h=Cu(i,t,e,n,Ws,Xs,qs,vl);if(h){const u=new T;sn.getBarycoord(vl,Ws,Xs,qs,u),s&&(h.uv=sn.getInterpolatedAttribute(s,o,l,c,u,new Q)),r&&(h.uv1=sn.getInterpolatedAttribute(r,o,l,c,u,new Q)),a&&(h.normal=sn.getInterpolatedAttribute(a,o,l,c,u,new T),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new T,materialIndex:0};sn.getNormal(Ws,Xs,qs,d.normal),h.face=d,h.barycoord=u}return h}class Pe extends we{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let d=0,p=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ie(c,3)),this.setAttribute("normal",new ie(h,3)),this.setAttribute("uv",new ie(u,2));function g(_,f,m,M,x,y,L,R,b,P,N){const v=y/b,w=L/P,O=y/2,B=L/2,k=R/2,X=b+1,z=P+1;let j=0,H=0;const at=new T;for(let ft=0;ft<z;ft++){const pt=ft*w-B;for(let Vt=0;Vt<X;Vt++){const Wt=Vt*v-O;at[_]=Wt*M,at[f]=pt*x,at[m]=k,c.push(at.x,at.y,at.z),at[_]=0,at[f]=0,at[m]=R>0?1:-1,h.push(at.x,at.y,at.z),u.push(Vt/b),u.push(1-ft/P),j+=1}}for(let ft=0;ft<P;ft++)for(let pt=0;pt<b;pt++){const Vt=d+pt+X*ft,Wt=d+pt+X*(ft+1),q=d+(pt+1)+X*(ft+1),et=d+(pt+1)+X*ft;l.push(Vt,Wt,et),l.push(Wt,q,et),H+=6}o.addGroup(p,H,N),p+=H,d+=j}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Pe(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Ki(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ve(i){const t={};for(let e=0;e<i.length;e++){const n=Ki(i[e]);for(const s in n)t[s]=n[s]}return t}function Ru(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Jc(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Jt.workingColorSpace}const ws={clone:Ki,merge:Ve};var Pu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Lu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class he extends di{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pu,this.fragmentShader=Lu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ki(t.uniforms),this.uniformsGroups=Ru(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Zc extends Ce{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ne,this.projectionMatrix=new ne,this.projectionMatrixInverse=new ne,this.coordinateSystem=Pn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Hn=new T,_l=new Q,xl=new Q;class Qe extends Zc{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=ho*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(kr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ho*2*Math.atan(Math.tan(kr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Hn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z),Hn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z)}getViewSize(t,e){return this.getViewBounds(t,_l,xl),e.subVectors(xl,_l)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(kr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ti=-90,Ai=1;class Du extends Ce{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Qe(Ti,Ai,t,e);s.layers=this.layers,this.add(s);const r=new Qe(Ti,Ai,t,e);r.layers=this.layers,this.add(r);const a=new Qe(Ti,Ai,t,e);a.layers=this.layers,this.add(a);const o=new Qe(Ti,Ai,t,e);o.layers=this.layers,this.add(o);const l=new Qe(Ti,Ai,t,e);l.layers=this.layers,this.add(l);const c=new Qe(Ti,Ai,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===Pn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===wr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,d,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Qc extends ke{constructor(t,e,n,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Hi,super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Iu extends pn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Qc(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:tn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Pe(5,5,5),r=new he({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:De,blending:Ln});r.uniforms.tEquirect.value=e;const a=new it(s,r),o=e.minFilter;return e.minFilter===ci&&(e.minFilter=tn),new Du(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const oa=new T,Uu=new T,Nu=new Ht;class ri{constructor(t=new T(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=oa.subVectors(n,e).cross(Uu.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(oa),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Nu.getNormalMatrix(t),s=this.coplanarPoint(oa).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ei=new Zi,js=new T;class Do{constructor(t=new ri,e=new ri,n=new ri,s=new ri,r=new ri,a=new ri){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Pn){const n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],d=s[7],p=s[8],g=s[9],_=s[10],f=s[11],m=s[12],M=s[13],x=s[14],y=s[15];if(n[0].setComponents(l-r,d-c,f-p,y-m).normalize(),n[1].setComponents(l+r,d+c,f+p,y+m).normalize(),n[2].setComponents(l+a,d+h,f+g,y+M).normalize(),n[3].setComponents(l-a,d-h,f-g,y-M).normalize(),n[4].setComponents(l-o,d-u,f-_,y-x).normalize(),e===Pn)n[5].setComponents(l+o,d+u,f+_,y+x).normalize();else if(e===wr)n[5].setComponents(o,u,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ei.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ei.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ei)}intersectsSprite(t){return ei.center.set(0,0,0),ei.radius=.7071067811865476,ei.applyMatrix4(t.matrixWorld),this.intersectsSphere(ei)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(js.x=s.normal.x>0?t.max.x:t.min.x,js.y=s.normal.y>0?t.max.y:t.min.y,js.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(js)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function th(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Fu(i){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<u.length;p++){const g=u[d],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let p=0,g=u.length;p<g;p++){const _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class Fn extends we{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=t/o,d=e/l,p=[],g=[],_=[],f=[];for(let m=0;m<h;m++){const M=m*d-a;for(let x=0;x<c;x++){const y=x*u-r;g.push(y,-M,0),_.push(0,0,1),f.push(x/o),f.push(1-m/l)}}for(let m=0;m<l;m++)for(let M=0;M<o;M++){const x=M+c*m,y=M+c*(m+1),L=M+1+c*(m+1),R=M+1+c*m;p.push(x,y,R),p.push(y,L,R)}this.setIndex(p),this.setAttribute("position",new ie(g,3)),this.setAttribute("normal",new ie(_,3)),this.setAttribute("uv",new ie(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Fn(t.width,t.height,t.widthSegments,t.heightSegments)}}var Ou=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Bu=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ku=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,zu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Gu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Hu=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Wu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Xu=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,qu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Yu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ku=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,$u=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ju=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ju=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Zu=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Qu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,td=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ed=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,nd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,id=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,sd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,rd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,ad=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,od=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ld=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,cd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,hd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ud=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,dd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,fd="gl_FragColor = linearToOutputTexel( gl_FragColor );",pd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,md=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,gd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,vd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,_d=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,xd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,yd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Md=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Sd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,wd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ed=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,bd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Td=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ad=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Cd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Rd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Pd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ld=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Dd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Id=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ud=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Nd=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Fd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Od=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Bd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,kd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,zd=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vd=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Hd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Wd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Xd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,qd=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Kd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,$d=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,jd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Jd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Zd=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Qd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,tf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,ef=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,nf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,sf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,af=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,of=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,lf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,cf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,hf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,uf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,df=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,ff=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,pf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,mf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,gf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,vf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,_f=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,xf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,yf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Mf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Sf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,wf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ef=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,bf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Tf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Af=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Cf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Rf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Pf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Lf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Df=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,If=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Uf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Nf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Ff=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Of=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Bf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,zf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Wf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Xf=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,qf=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Yf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Kf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$f=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,jf=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Jf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Zf=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ep=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,np=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ip=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,sp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,rp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ap=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,op=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,lp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,up=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,dp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,mp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,gp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Gt={alphahash_fragment:Ou,alphahash_pars_fragment:Bu,alphamap_fragment:ku,alphamap_pars_fragment:zu,alphatest_fragment:Vu,alphatest_pars_fragment:Gu,aomap_fragment:Hu,aomap_pars_fragment:Wu,batching_pars_vertex:Xu,batching_vertex:qu,begin_vertex:Yu,beginnormal_vertex:Ku,bsdfs:$u,iridescence_fragment:ju,bumpmap_pars_fragment:Ju,clipping_planes_fragment:Zu,clipping_planes_pars_fragment:Qu,clipping_planes_pars_vertex:td,clipping_planes_vertex:ed,color_fragment:nd,color_pars_fragment:id,color_pars_vertex:sd,color_vertex:rd,common:ad,cube_uv_reflection_fragment:od,defaultnormal_vertex:ld,displacementmap_pars_vertex:cd,displacementmap_vertex:hd,emissivemap_fragment:ud,emissivemap_pars_fragment:dd,colorspace_fragment:fd,colorspace_pars_fragment:pd,envmap_fragment:md,envmap_common_pars_fragment:gd,envmap_pars_fragment:vd,envmap_pars_vertex:_d,envmap_physical_pars_fragment:Rd,envmap_vertex:xd,fog_vertex:yd,fog_pars_vertex:Md,fog_fragment:Sd,fog_pars_fragment:wd,gradientmap_pars_fragment:Ed,lightmap_pars_fragment:bd,lights_lambert_fragment:Td,lights_lambert_pars_fragment:Ad,lights_pars_begin:Cd,lights_toon_fragment:Pd,lights_toon_pars_fragment:Ld,lights_phong_fragment:Dd,lights_phong_pars_fragment:Id,lights_physical_fragment:Ud,lights_physical_pars_fragment:Nd,lights_fragment_begin:Fd,lights_fragment_maps:Od,lights_fragment_end:Bd,logdepthbuf_fragment:kd,logdepthbuf_pars_fragment:zd,logdepthbuf_pars_vertex:Vd,logdepthbuf_vertex:Gd,map_fragment:Hd,map_pars_fragment:Wd,map_particle_fragment:Xd,map_particle_pars_fragment:qd,metalnessmap_fragment:Yd,metalnessmap_pars_fragment:Kd,morphinstance_vertex:$d,morphcolor_vertex:jd,morphnormal_vertex:Jd,morphtarget_pars_vertex:Zd,morphtarget_vertex:Qd,normal_fragment_begin:tf,normal_fragment_maps:ef,normal_pars_fragment:nf,normal_pars_vertex:sf,normal_vertex:rf,normalmap_pars_fragment:af,clearcoat_normal_fragment_begin:of,clearcoat_normal_fragment_maps:lf,clearcoat_pars_fragment:cf,iridescence_pars_fragment:hf,opaque_fragment:uf,packing:df,premultiplied_alpha_fragment:ff,project_vertex:pf,dithering_fragment:mf,dithering_pars_fragment:gf,roughnessmap_fragment:vf,roughnessmap_pars_fragment:_f,shadowmap_pars_fragment:xf,shadowmap_pars_vertex:yf,shadowmap_vertex:Mf,shadowmask_pars_fragment:Sf,skinbase_vertex:wf,skinning_pars_vertex:Ef,skinning_vertex:bf,skinnormal_vertex:Tf,specularmap_fragment:Af,specularmap_pars_fragment:Cf,tonemapping_fragment:Rf,tonemapping_pars_fragment:Pf,transmission_fragment:Lf,transmission_pars_fragment:Df,uv_pars_fragment:If,uv_pars_vertex:Uf,uv_vertex:Nf,worldpos_vertex:Ff,background_vert:Of,background_frag:Bf,backgroundCube_vert:kf,backgroundCube_frag:zf,cube_vert:Vf,cube_frag:Gf,depth_vert:Hf,depth_frag:Wf,distanceRGBA_vert:Xf,distanceRGBA_frag:qf,equirect_vert:Yf,equirect_frag:Kf,linedashed_vert:$f,linedashed_frag:jf,meshbasic_vert:Jf,meshbasic_frag:Zf,meshlambert_vert:Qf,meshlambert_frag:tp,meshmatcap_vert:ep,meshmatcap_frag:np,meshnormal_vert:ip,meshnormal_frag:sp,meshphong_vert:rp,meshphong_frag:ap,meshphysical_vert:op,meshphysical_frag:lp,meshtoon_vert:cp,meshtoon_frag:hp,points_vert:up,points_frag:dp,shadow_vert:fp,shadow_frag:pp,sprite_vert:mp,sprite_frag:gp},dt={common:{diffuse:{value:new Ut(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ht}},envmap:{envMap:{value:null},envMapRotation:{value:new Ht},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ht}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ht}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ht},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ht},normalScale:{value:new Q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ht},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ht}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ht}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ht}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ut(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ut(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0},uvTransform:{value:new Ht}},sprite:{diffuse:{value:new Ut(16777215)},opacity:{value:1},center:{value:new Q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}}},gn={basic:{uniforms:Ve([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.fog]),vertexShader:Gt.meshbasic_vert,fragmentShader:Gt.meshbasic_frag},lambert:{uniforms:Ve([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new Ut(0)}}]),vertexShader:Gt.meshlambert_vert,fragmentShader:Gt.meshlambert_frag},phong:{uniforms:Ve([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new Ut(0)},specular:{value:new Ut(1118481)},shininess:{value:30}}]),vertexShader:Gt.meshphong_vert,fragmentShader:Gt.meshphong_frag},standard:{uniforms:Ve([dt.common,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.roughnessmap,dt.metalnessmap,dt.fog,dt.lights,{emissive:{value:new Ut(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag},toon:{uniforms:Ve([dt.common,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.gradientmap,dt.fog,dt.lights,{emissive:{value:new Ut(0)}}]),vertexShader:Gt.meshtoon_vert,fragmentShader:Gt.meshtoon_frag},matcap:{uniforms:Ve([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,{matcap:{value:null}}]),vertexShader:Gt.meshmatcap_vert,fragmentShader:Gt.meshmatcap_frag},points:{uniforms:Ve([dt.points,dt.fog]),vertexShader:Gt.points_vert,fragmentShader:Gt.points_frag},dashed:{uniforms:Ve([dt.common,dt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Gt.linedashed_vert,fragmentShader:Gt.linedashed_frag},depth:{uniforms:Ve([dt.common,dt.displacementmap]),vertexShader:Gt.depth_vert,fragmentShader:Gt.depth_frag},normal:{uniforms:Ve([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,{opacity:{value:1}}]),vertexShader:Gt.meshnormal_vert,fragmentShader:Gt.meshnormal_frag},sprite:{uniforms:Ve([dt.sprite,dt.fog]),vertexShader:Gt.sprite_vert,fragmentShader:Gt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ht},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Gt.background_vert,fragmentShader:Gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ht}},vertexShader:Gt.backgroundCube_vert,fragmentShader:Gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Gt.cube_vert,fragmentShader:Gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Gt.equirect_vert,fragmentShader:Gt.equirect_frag},distanceRGBA:{uniforms:Ve([dt.common,dt.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Gt.distanceRGBA_vert,fragmentShader:Gt.distanceRGBA_frag},shadow:{uniforms:Ve([dt.lights,dt.fog,{color:{value:new Ut(0)},opacity:{value:1}}]),vertexShader:Gt.shadow_vert,fragmentShader:Gt.shadow_frag}};gn.physical={uniforms:Ve([gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ht},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ht},clearcoatNormalScale:{value:new Q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ht},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ht},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ht},sheen:{value:0},sheenColor:{value:new Ut(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ht},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ht},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ht},transmissionSamplerSize:{value:new Q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ht},attenuationDistance:{value:0},attenuationColor:{value:new Ut(0)},specularColor:{value:new Ut(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ht},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ht},anisotropyVector:{value:new Q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ht}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag};const Js={r:0,b:0,g:0},ni=new an,vp=new ne;function _p(i,t,e,n,s,r,a){const o=new Ut(0);let l=r===!0?0:1,c,h,u=null,d=0,p=null;function g(M){let x=M.isScene===!0?M.background:null;return x&&x.isTexture&&(x=(M.backgroundBlurriness>0?e:t).get(x)),x}function _(M){let x=!1;const y=g(M);y===null?m(o,l):y&&y.isColor&&(m(y,1),x=!0);const L=i.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,a):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function f(M,x){const y=g(x);y&&(y.isCubeTexture||y.mapping===Rr)?(h===void 0&&(h=new it(new Pe(1,1,1),new he({name:"BackgroundCubeMaterial",uniforms:Ki(gn.backgroundCube.uniforms),vertexShader:gn.backgroundCube.vertexShader,fragmentShader:gn.backgroundCube.fragmentShader,side:De,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,R,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),ni.copy(x.backgroundRotation),ni.x*=-1,ni.y*=-1,ni.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ni.y*=-1,ni.z*=-1),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(vp.makeRotationFromEuler(ni)),h.material.toneMapped=Jt.getTransfer(y.colorSpace)!==le,(u!==y||d!==y.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=y,d=y.version,p=i.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new it(new Fn(2,2),new he({name:"BackgroundMaterial",uniforms:Ki(gn.background.uniforms),vertexShader:gn.background.vertexShader,fragmentShader:gn.background.fragmentShader,side:Un,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=Jt.getTransfer(y.colorSpace)!==le,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||d!==y.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,d=y.version,p=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function m(M,x){M.getRGB(Js,Jc(i)),n.buffers.color.setClear(Js.r,Js.g,Js.b,x,a)}return{getClearColor:function(){return o},setClearColor:function(M,x=1){o.set(M),l=x,m(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,m(o,l)},render:_,addToRenderList:f}}function xp(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(v,w,O,B,k){let X=!1;const z=u(B,O,w);r!==z&&(r=z,c(r.object)),X=p(v,B,O,k),X&&g(v,B,O,k),k!==null&&t.update(k,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,y(v,w,O,B),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return i.createVertexArray()}function c(v){return i.bindVertexArray(v)}function h(v){return i.deleteVertexArray(v)}function u(v,w,O){const B=O.wireframe===!0;let k=n[v.id];k===void 0&&(k={},n[v.id]=k);let X=k[w.id];X===void 0&&(X={},k[w.id]=X);let z=X[B];return z===void 0&&(z=d(l()),X[B]=z),z}function d(v){const w=[],O=[],B=[];for(let k=0;k<e;k++)w[k]=0,O[k]=0,B[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:O,attributeDivisors:B,object:v,attributes:{},index:null}}function p(v,w,O,B){const k=r.attributes,X=w.attributes;let z=0;const j=O.getAttributes();for(const H in j)if(j[H].location>=0){const ft=k[H];let pt=X[H];if(pt===void 0&&(H==="instanceMatrix"&&v.instanceMatrix&&(pt=v.instanceMatrix),H==="instanceColor"&&v.instanceColor&&(pt=v.instanceColor)),ft===void 0||ft.attribute!==pt||pt&&ft.data!==pt.data)return!0;z++}return r.attributesNum!==z||r.index!==B}function g(v,w,O,B){const k={},X=w.attributes;let z=0;const j=O.getAttributes();for(const H in j)if(j[H].location>=0){let ft=X[H];ft===void 0&&(H==="instanceMatrix"&&v.instanceMatrix&&(ft=v.instanceMatrix),H==="instanceColor"&&v.instanceColor&&(ft=v.instanceColor));const pt={};pt.attribute=ft,ft&&ft.data&&(pt.data=ft.data),k[H]=pt,z++}r.attributes=k,r.attributesNum=z,r.index=B}function _(){const v=r.newAttributes;for(let w=0,O=v.length;w<O;w++)v[w]=0}function f(v){m(v,0)}function m(v,w){const O=r.newAttributes,B=r.enabledAttributes,k=r.attributeDivisors;O[v]=1,B[v]===0&&(i.enableVertexAttribArray(v),B[v]=1),k[v]!==w&&(i.vertexAttribDivisor(v,w),k[v]=w)}function M(){const v=r.newAttributes,w=r.enabledAttributes;for(let O=0,B=w.length;O<B;O++)w[O]!==v[O]&&(i.disableVertexAttribArray(O),w[O]=0)}function x(v,w,O,B,k,X,z){z===!0?i.vertexAttribIPointer(v,w,O,k,X):i.vertexAttribPointer(v,w,O,B,k,X)}function y(v,w,O,B){_();const k=B.attributes,X=O.getAttributes(),z=w.defaultAttributeValues;for(const j in X){const H=X[j];if(H.location>=0){let at=k[j];if(at===void 0&&(j==="instanceMatrix"&&v.instanceMatrix&&(at=v.instanceMatrix),j==="instanceColor"&&v.instanceColor&&(at=v.instanceColor)),at!==void 0){const ft=at.normalized,pt=at.itemSize,Vt=t.get(at);if(Vt===void 0)continue;const Wt=Vt.buffer,q=Vt.type,et=Vt.bytesPerElement,St=q===i.INT||q===i.UNSIGNED_INT||at.gpuType===Eo;if(at.isInterleavedBufferAttribute){const ht=at.data,It=ht.stride,Dt=at.offset;if(ht.isInstancedInterleavedBuffer){for(let ct=0;ct<H.locationSize;ct++)m(H.location+ct,ht.meshPerAttribute);v.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let ct=0;ct<H.locationSize;ct++)f(H.location+ct);i.bindBuffer(i.ARRAY_BUFFER,Wt);for(let ct=0;ct<H.locationSize;ct++)x(H.location+ct,pt/H.locationSize,q,ft,It*et,(Dt+pt/H.locationSize*ct)*et,St)}else{if(at.isInstancedBufferAttribute){for(let ht=0;ht<H.locationSize;ht++)m(H.location+ht,at.meshPerAttribute);v.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=at.meshPerAttribute*at.count)}else for(let ht=0;ht<H.locationSize;ht++)f(H.location+ht);i.bindBuffer(i.ARRAY_BUFFER,Wt);for(let ht=0;ht<H.locationSize;ht++)x(H.location+ht,pt/H.locationSize,q,ft,pt*et,pt/H.locationSize*ht*et,St)}}else if(z!==void 0){const ft=z[j];if(ft!==void 0)switch(ft.length){case 2:i.vertexAttrib2fv(H.location,ft);break;case 3:i.vertexAttrib3fv(H.location,ft);break;case 4:i.vertexAttrib4fv(H.location,ft);break;default:i.vertexAttrib1fv(H.location,ft)}}}}M()}function L(){P();for(const v in n){const w=n[v];for(const O in w){const B=w[O];for(const k in B)h(B[k].object),delete B[k];delete w[O]}delete n[v]}}function R(v){if(n[v.id]===void 0)return;const w=n[v.id];for(const O in w){const B=w[O];for(const k in B)h(B[k].object),delete B[k];delete w[O]}delete n[v.id]}function b(v){for(const w in n){const O=n[w];if(O[v.id]===void 0)continue;const B=O[v.id];for(const k in B)h(B[k].object),delete B[k];delete O[v.id]}}function P(){N(),a=!0,r!==s&&(r=s,c(r.object))}function N(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:P,resetDefaultState:N,dispose:L,releaseStatesOfGeometry:R,releaseStatesOfProgram:b,initAttributes:_,enableAttribute:f,disableUnusedAttributes:M}}function yp(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];e.update(p,n,1)}function l(c,h,u,d){if(u===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)a(c[g],h[g],d[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_];for(let _=0;_<d.length;_++)e.update(g,n,d[_])}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Mp(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const b=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(b){return!(b!==fn&&n.convert(b)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(b){const P=b===Dn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(b!==Nn&&n.convert(b)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==_n&&!P)}function l(b){if(b==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(d===!0){const b=t.get("EXT_clip_control");b.clipControlEXT(b.LOWER_LEFT_EXT,b.ZERO_TO_ONE_EXT)}const p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),f=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),x=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),L=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:f,maxAttributes:m,maxVertexUniforms:M,maxVaryings:x,maxFragmentUniforms:y,vertexTextures:L,maxSamples:R}}function Sp(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new ri,o=new Ht,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const p=u.length!==0||d||n!==0||s;return s=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,p){const g=u.clippingPlanes,_=u.clipIntersection,f=u.clipShadows,m=i.get(u);if(!s||g===null||g.length===0||r&&!f)r?h(null):c();else{const M=r?0:n,x=M*4;let y=m.clippingState||null;l.value=y,y=h(g,d,x,p);for(let L=0;L!==x;++L)y[L]=e[L];m.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,p,g){const _=u!==null?u.length:0;let f=null;if(_!==0){if(f=l.value,g!==!0||f===null){const m=p+_*4,M=d.matrixWorldInverse;o.getNormalMatrix(M),(f===null||f.length<m)&&(f=new Float32Array(m));for(let x=0,y=p;x!==_;++x,y+=4)a.copy(u[x]).applyMatrix4(M,o),a.normal.toArray(f,y),f[y+3]=a.constant}l.value=f,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,f}}function wp(i){let t=new WeakMap;function e(a,o){return o===Na?a.mapping=Hi:o===Fa&&(a.mapping=Wi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Na||o===Fa)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Iu(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class Io extends Zc{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Fi=4,yl=[.125,.215,.35,.446,.526,.582],li=20,la=new Io,Ml=new Ut;let ca=null,ha=0,ua=0,da=!1;const ai=(1+Math.sqrt(5))/2,Ci=1/ai,Sl=[new T(-ai,Ci,0),new T(ai,Ci,0),new T(-Ci,0,ai),new T(Ci,0,ai),new T(0,ai,-Ci),new T(0,ai,Ci),new T(-1,1,-1),new T(1,1,-1),new T(-1,1,1),new T(1,1,1)];class wl{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){ca=this._renderer.getRenderTarget(),ha=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Tl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=bl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ca,ha,ua),this._renderer.xr.enabled=da,t.scissorTest=!1,Zs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Hi||t.mapping===Wi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ca=this._renderer.getRenderTarget(),ha=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:tn,minFilter:tn,generateMipmaps:!1,type:Dn,format:fn,colorSpace:$n,depthBuffer:!1},s=El(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=El(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ep(r)),this._blurMaterial=bp(r,t,e)}return s}_compileMaterial(t){const e=new it(this._lodPlanes[0],t);this._renderer.compile(e,la)}_sceneToCubeUV(t,e,n,s){const o=new Qe(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(Ml),h.toneMapping=Yn,h.autoClear=!1;const p=new Se({name:"PMREM.Background",side:De,depthWrite:!1,depthTest:!1}),g=new it(new Pe,p);let _=!1;const f=t.background;f?f.isColor&&(p.color.copy(f),t.background=null,_=!0):(p.color.copy(Ml),_=!0);for(let m=0;m<6;m++){const M=m%3;M===0?(o.up.set(0,l[m],0),o.lookAt(c[m],0,0)):M===1?(o.up.set(0,0,l[m]),o.lookAt(0,c[m],0)):(o.up.set(0,l[m],0),o.lookAt(0,0,c[m]));const x=this._cubeSize;Zs(s,M*x,m>2?x:0,x,x),h.setRenderTarget(s),_&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,t.background=f}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===Hi||t.mapping===Wi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Tl()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=bl());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new it(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;Zs(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,la)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Sl[(s-r-1)%Sl.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new it(this._lodPlanes[s],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*li-1),_=r/g,f=isFinite(r)?1+Math.floor(h*_):li;f>li&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${li}`);const m=[];let M=0;for(let b=0;b<li;++b){const P=b/_,N=Math.exp(-P*P/2);m.push(N),b===0?M+=N:b<f&&(M+=2*N)}for(let b=0;b<m.length;b++)m[b]=m[b]/M;d.envMap.value=t.texture,d.samples.value=f,d.weights.value=m,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;const y=this._sizeLods[s],L=3*y*(s>x-Fi?s-x+Fi:0),R=4*(this._cubeSize-y);Zs(e,L,R,3*y,2*y),l.setRenderTarget(e),l.render(u,la)}}function Ep(i){const t=[],e=[],n=[];let s=i;const r=i-Fi+1+yl.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-Fi?l=yl[a-i+Fi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,_=3,f=2,m=1,M=new Float32Array(_*g*p),x=new Float32Array(f*g*p),y=new Float32Array(m*g*p);for(let R=0;R<p;R++){const b=R%3*2/3-1,P=R>2?0:-1,N=[b,P,0,b+2/3,P,0,b+2/3,P+1,0,b,P,0,b+2/3,P+1,0,b,P+1,0];M.set(N,_*g*R),x.set(d,f*g*R);const v=[R,R,R,R,R,R];y.set(v,m*g*R)}const L=new we;L.setAttribute("position",new Be(M,_)),L.setAttribute("uv",new Be(x,f)),L.setAttribute("faceIndex",new Be(y,m)),t.push(L),s>Fi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function El(i,t,e){const n=new pn(i,t,e);return n.texture.mapping=Rr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Zs(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function bp(i,t,e){const n=new Float32Array(li),s=new T(0,1,0);return new he({name:"SphericalGaussianBlur",defines:{n:li,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Uo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function bl(){return new he({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Uo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function Tl(){return new he({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Uo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function Uo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Tp(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Na||l===Fa,h=l===Hi||l===Wi;if(c||h){let u=t.get(o);const d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return e===null&&(e=new wl(i)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const p=o.image;return c&&p&&p.height>0||h&&p&&s(p)?(e===null&&(e=new wl(i)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function Ap(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&gr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Cp(i,t,e,n){const s={},r=new WeakMap;function a(u){const d=u.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);for(const g in d.morphAttributes){const _=d.morphAttributes[g];for(let f=0,m=_.length;f<m;f++)t.remove(_[f])}d.removeEventListener("dispose",a),delete s[d.id];const p=r.get(d);p&&(t.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,e.memory.geometries++),d}function l(u){const d=u.attributes;for(const g in d)t.update(d[g],i.ARRAY_BUFFER);const p=u.morphAttributes;for(const g in p){const _=p[g];for(let f=0,m=_.length;f<m;f++)t.update(_[f],i.ARRAY_BUFFER)}}function c(u){const d=[],p=u.index,g=u.attributes.position;let _=0;if(p!==null){const M=p.array;_=p.version;for(let x=0,y=M.length;x<y;x+=3){const L=M[x+0],R=M[x+1],b=M[x+2];d.push(L,R,R,b,b,L)}}else if(g!==void 0){const M=g.array;_=g.version;for(let x=0,y=M.length/3-1;x<y;x+=3){const L=x+0,R=x+1,b=x+2;d.push(L,R,R,b,b,L)}}else return;const f=new(Hc(d)?jc:$c)(d,1);f.version=_;const m=r.get(u);m&&t.remove(m),r.set(u,f)}function h(u){const d=r.get(u);if(d){const p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Rp(i,t,e){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,p){i.drawElements(n,p,r,d*a),e.update(p,n,1)}function c(d,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,d*a,g),e.update(p,n,g))}function h(d,p,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,d,0,g);let f=0;for(let m=0;m<g;m++)f+=p[m];e.update(f,n,1)}function u(d,p,g,_){if(g===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let m=0;m<d.length;m++)c(d[m]/a,p[m],_[m]);else{f.multiDrawElementsInstancedWEBGL(n,p,0,r,d,0,_,0,g);let m=0;for(let M=0;M<g;M++)m+=p[M];for(let M=0;M<_.length;M++)e.update(m,n,_[M])}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Pp(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Lp(i,t,e){const n=new WeakMap,s=new re;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let v=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",v)};var p=v;d!==void 0&&d.texture.dispose();const g=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,f=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let y=0;g===!0&&(y=1),_===!0&&(y=2),f===!0&&(y=3);let L=o.attributes.position.count*y,R=1;L>t.maxTextureSize&&(R=Math.ceil(L/t.maxTextureSize),L=t.maxTextureSize);const b=new Float32Array(L*R*4*u),P=new Xc(b,L,R,u);P.type=_n,P.needsUpdate=!0;const N=y*4;for(let w=0;w<u;w++){const O=m[w],B=M[w],k=x[w],X=L*R*4*w;for(let z=0;z<O.count;z++){const j=z*N;g===!0&&(s.fromBufferAttribute(O,z),b[X+j+0]=s.x,b[X+j+1]=s.y,b[X+j+2]=s.z,b[X+j+3]=0),_===!0&&(s.fromBufferAttribute(B,z),b[X+j+4]=s.x,b[X+j+5]=s.y,b[X+j+6]=s.z,b[X+j+7]=0),f===!0&&(s.fromBufferAttribute(k,z),b[X+j+8]=s.x,b[X+j+9]=s.y,b[X+j+10]=s.z,b[X+j+11]=k.itemSize===4?s.w:1)}}d={count:u,texture:P,size:new Q(L,R)},n.set(o,d),o.addEventListener("dispose",v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let g=0;for(let f=0;f<c.length;f++)g+=c[f];const _=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Dp(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class eh extends ke{constructor(t,e,n,s,r,a,o,l,c,h=ki){if(h!==ki&&h!==Yi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===ki&&(n=hi),n===void 0&&h===Yi&&(n=qi),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Ye,this.minFilter=l!==void 0?l:Ye,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const nh=new ke,Al=new eh(1,1),ih=new Xc,sh=new _u,rh=new Qc,Cl=[],Rl=[],Pl=new Float32Array(16),Ll=new Float32Array(9),Dl=new Float32Array(4);function Qi(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=Cl[s];if(r===void 0&&(r=new Float32Array(s),Cl[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Ee(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function be(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Lr(i,t){let e=Rl[t];e===void 0&&(e=new Int32Array(t),Rl[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Ip(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Up(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ee(e,t))return;i.uniform2fv(this.addr,t),be(e,t)}}function Np(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ee(e,t))return;i.uniform3fv(this.addr,t),be(e,t)}}function Fp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ee(e,t))return;i.uniform4fv(this.addr,t),be(e,t)}}function Op(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ee(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),be(e,t)}else{if(Ee(e,n))return;Dl.set(n),i.uniformMatrix2fv(this.addr,!1,Dl),be(e,n)}}function Bp(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ee(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),be(e,t)}else{if(Ee(e,n))return;Ll.set(n),i.uniformMatrix3fv(this.addr,!1,Ll),be(e,n)}}function kp(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ee(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),be(e,t)}else{if(Ee(e,n))return;Pl.set(n),i.uniformMatrix4fv(this.addr,!1,Pl),be(e,n)}}function zp(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Vp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ee(e,t))return;i.uniform2iv(this.addr,t),be(e,t)}}function Gp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ee(e,t))return;i.uniform3iv(this.addr,t),be(e,t)}}function Hp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ee(e,t))return;i.uniform4iv(this.addr,t),be(e,t)}}function Wp(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Xp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ee(e,t))return;i.uniform2uiv(this.addr,t),be(e,t)}}function qp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ee(e,t))return;i.uniform3uiv(this.addr,t),be(e,t)}}function Yp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ee(e,t))return;i.uniform4uiv(this.addr,t),be(e,t)}}function Kp(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Al.compareFunction=Gc,r=Al):r=nh,e.setTexture2D(t||r,s)}function $p(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||sh,s)}function jp(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||rh,s)}function Jp(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||ih,s)}function Zp(i){switch(i){case 5126:return Ip;case 35664:return Up;case 35665:return Np;case 35666:return Fp;case 35674:return Op;case 35675:return Bp;case 35676:return kp;case 5124:case 35670:return zp;case 35667:case 35671:return Vp;case 35668:case 35672:return Gp;case 35669:case 35673:return Hp;case 5125:return Wp;case 36294:return Xp;case 36295:return qp;case 36296:return Yp;case 35678:case 36198:case 36298:case 36306:case 35682:return Kp;case 35679:case 36299:case 36307:return $p;case 35680:case 36300:case 36308:case 36293:return jp;case 36289:case 36303:case 36311:case 36292:return Jp}}function Qp(i,t){i.uniform1fv(this.addr,t)}function tm(i,t){const e=Qi(t,this.size,2);i.uniform2fv(this.addr,e)}function em(i,t){const e=Qi(t,this.size,3);i.uniform3fv(this.addr,e)}function nm(i,t){const e=Qi(t,this.size,4);i.uniform4fv(this.addr,e)}function im(i,t){const e=Qi(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function sm(i,t){const e=Qi(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function rm(i,t){const e=Qi(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function am(i,t){i.uniform1iv(this.addr,t)}function om(i,t){i.uniform2iv(this.addr,t)}function lm(i,t){i.uniform3iv(this.addr,t)}function cm(i,t){i.uniform4iv(this.addr,t)}function hm(i,t){i.uniform1uiv(this.addr,t)}function um(i,t){i.uniform2uiv(this.addr,t)}function dm(i,t){i.uniform3uiv(this.addr,t)}function fm(i,t){i.uniform4uiv(this.addr,t)}function pm(i,t,e){const n=this.cache,s=t.length,r=Lr(e,s);Ee(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||nh,r[a])}function mm(i,t,e){const n=this.cache,s=t.length,r=Lr(e,s);Ee(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||sh,r[a])}function gm(i,t,e){const n=this.cache,s=t.length,r=Lr(e,s);Ee(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||rh,r[a])}function vm(i,t,e){const n=this.cache,s=t.length,r=Lr(e,s);Ee(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||ih,r[a])}function _m(i){switch(i){case 5126:return Qp;case 35664:return tm;case 35665:return em;case 35666:return nm;case 35674:return im;case 35675:return sm;case 35676:return rm;case 5124:case 35670:return am;case 35667:case 35671:return om;case 35668:case 35672:return lm;case 35669:case 35673:return cm;case 5125:return hm;case 36294:return um;case 36295:return dm;case 36296:return fm;case 35678:case 36198:case 36298:case 36306:case 35682:return pm;case 35679:case 36299:case 36307:return mm;case 35680:case 36300:case 36308:case 36293:return gm;case 36289:case 36303:case 36311:case 36292:return vm}}class xm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Zp(e.type)}}class ym{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=_m(e.type)}}class Mm{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const fa=/(\w+)(\])?(\[|\.)?/g;function Il(i,t){i.seq.push(t),i.map[t.id]=t}function Sm(i,t,e){const n=i.name,s=n.length;for(fa.lastIndex=0;;){const r=fa.exec(n),a=fa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Il(e,c===void 0?new xm(o,i,t):new ym(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new Mm(o),Il(e,u)),e=u}}}class vr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);Sm(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function Ul(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const wm=37297;let Em=0;function bm(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}function Tm(i){const t=Jt.getPrimaries(Jt.workingColorSpace),e=Jt.getPrimaries(i);let n;switch(t===e?n="":t===Mr&&e===yr?n="LinearDisplayP3ToLinearSRGB":t===yr&&e===Mr&&(n="LinearSRGBToLinearDisplayP3"),i){case $n:case Pr:return[n,"LinearTransferOETF"];case Xe:case Lo:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Nl(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+bm(i.getShaderSource(t),a)}else return s}function Am(i,t){const e=Tm(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function Cm(i,t){let e;switch(t){case Tc:e="Linear";break;case Ac:e="Reinhard";break;case Cc:e="Cineon";break;case wo:e="ACESFilmic";break;case Rc:e="AgX";break;case Pc:e="Neutral";break;case jh:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Qs=new T;function Rm(){Jt.getLuminanceCoefficients(Qs);const i=Qs.x.toFixed(4),t=Qs.y.toFixed(4),e=Qs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Pm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(fs).join(`
`)}function Lm(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Dm(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function fs(i){return i!==""}function Fl(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Ol(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Im=/^[ \t]*#include +<([\w\d./]+)>/gm;function uo(i){return i.replace(Im,Nm)}const Um=new Map;function Nm(i,t){let e=Gt[t];if(e===void 0){const n=Um.get(t);if(n!==void 0)e=Gt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return uo(e)}const Fm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Bl(i){return i.replace(Fm,Om)}function Om(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function kl(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Bm(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Ec?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===Rh?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Cn&&(t="SHADOWMAP_TYPE_VSM"),t}function km(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Hi:case Wi:t="ENVMAP_TYPE_CUBE";break;case Rr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function zm(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Wi:t="ENVMAP_MODE_REFRACTION";break}return t}function Vm(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case bc:t="ENVMAP_BLENDING_MULTIPLY";break;case Kh:t="ENVMAP_BLENDING_MIX";break;case $h:t="ENVMAP_BLENDING_ADD";break}return t}function Gm(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function Hm(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=Bm(e),c=km(e),h=zm(e),u=Vm(e),d=Gm(e),p=Pm(e),g=Lm(r),_=s.createProgram();let f,m,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(fs).join(`
`),f.length>0&&(f+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(fs).join(`
`),m.length>0&&(m+=`
`)):(f=[kl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(fs).join(`
`),m=[kl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Yn?"#define TONE_MAPPING":"",e.toneMapping!==Yn?Gt.tonemapping_pars_fragment:"",e.toneMapping!==Yn?Cm("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Gt.colorspace_pars_fragment,Am("linearToOutputTexel",e.outputColorSpace),Rm(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(fs).join(`
`)),a=uo(a),a=Fl(a,e),a=Ol(a,e),o=uo(o),o=Fl(o,e),o=Ol(o,e),a=Bl(a),o=Bl(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,f=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,m=["#define varying in",e.glslVersion===nl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===nl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=M+f+a,y=M+m+o,L=Ul(s,s.VERTEX_SHADER,x),R=Ul(s,s.FRAGMENT_SHADER,y);s.attachShader(_,L),s.attachShader(_,R),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function b(w){if(i.debug.checkShaderErrors){const O=s.getProgramInfoLog(_).trim(),B=s.getShaderInfoLog(L).trim(),k=s.getShaderInfoLog(R).trim();let X=!0,z=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,L,R);else{const j=Nl(s,L,"vertex"),H=Nl(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+O+`
`+j+`
`+H)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(B===""||k==="")&&(z=!1);z&&(w.diagnostics={runnable:X,programLog:O,vertexShader:{log:B,prefix:f},fragmentShader:{log:k,prefix:m}})}s.deleteShader(L),s.deleteShader(R),P=new vr(s,_),N=Dm(s,_)}let P;this.getUniforms=function(){return P===void 0&&b(this),P};let N;this.getAttributes=function(){return N===void 0&&b(this),N};let v=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(_,wm)),v},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Em++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=L,this.fragmentShader=R,this}let Wm=0;class Xm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new qm(t),e.set(t,n)),n}}class qm{constructor(t){this.id=Wm++,this.code=t,this.usedTimes=0}}function Ym(i,t,e,n,s,r,a){const o=new Yc,l=new Xm,c=new Set,h=[],u=s.logarithmicDepthBuffer,d=s.reverseDepthBuffer,p=s.vertexTextures;let g=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(v){return c.add(v),v===0?"uv":`uv${v}`}function m(v,w,O,B,k){const X=B.fog,z=k.geometry,j=v.isMeshStandardMaterial?B.environment:null,H=(v.isMeshStandardMaterial?e:t).get(v.envMap||j),at=H&&H.mapping===Rr?H.image.height:null,ft=_[v.type];v.precision!==null&&(g=s.getMaxPrecision(v.precision),g!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",g,"instead."));const pt=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Vt=pt!==void 0?pt.length:0;let Wt=0;z.morphAttributes.position!==void 0&&(Wt=1),z.morphAttributes.normal!==void 0&&(Wt=2),z.morphAttributes.color!==void 0&&(Wt=3);let q,et,St,ht;if(ft){const We=gn[ft];q=We.vertexShader,et=We.fragmentShader}else q=v.vertexShader,et=v.fragmentShader,l.update(v),St=l.getVertexShaderID(v),ht=l.getFragmentShaderID(v);const It=i.getRenderTarget(),Dt=k.isInstancedMesh===!0,ct=k.isBatchedMesh===!0,mt=!!v.map,$=!!v.matcap,C=!!H,ot=!!v.aoMap,rt=!!v.lightMap,tt=!!v.bumpMap,lt=!!v.normalMap,Pt=!!v.displacementMap,xt=!!v.emissiveMap,A=!!v.metalnessMap,S=!!v.roughnessMap,F=v.anisotropy>0,Y=v.clearcoat>0,J=v.dispersion>0,K=v.iridescence>0,At=v.sheen>0,ut=v.transmission>0,wt=F&&!!v.anisotropyMap,qt=Y&&!!v.clearcoatMap,nt=Y&&!!v.clearcoatNormalMap,Et=Y&&!!v.clearcoatRoughnessMap,Ot=K&&!!v.iridescenceMap,Bt=K&&!!v.iridescenceThicknessMap,bt=At&&!!v.sheenColorMap,Yt=At&&!!v.sheenRoughnessMap,zt=!!v.specularMap,oe=!!v.specularColorMap,D=!!v.specularIntensityMap,yt=ut&&!!v.transmissionMap,W=ut&&!!v.thicknessMap,Z=!!v.gradientMap,gt=!!v.alphaMap,Mt=v.alphaTest>0,Kt=!!v.alphaHash,_e=!!v.extensions;let He=Yn;v.toneMapped&&(It===null||It.isXRRenderTarget===!0)&&(He=i.toneMapping);const jt={shaderID:ft,shaderType:v.type,shaderName:v.name,vertexShader:q,fragmentShader:et,defines:v.defines,customVertexShaderID:St,customFragmentShaderID:ht,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:g,batching:ct,batchingColor:ct&&k._colorsTexture!==null,instancing:Dt,instancingColor:Dt&&k.instanceColor!==null,instancingMorph:Dt&&k.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:It===null?i.outputColorSpace:It.isXRRenderTarget===!0?It.texture.colorSpace:$n,alphaToCoverage:!!v.alphaToCoverage,map:mt,matcap:$,envMap:C,envMapMode:C&&H.mapping,envMapCubeUVHeight:at,aoMap:ot,lightMap:rt,bumpMap:tt,normalMap:lt,displacementMap:p&&Pt,emissiveMap:xt,normalMapObjectSpace:lt&&v.normalMapType===tu,normalMapTangentSpace:lt&&v.normalMapType===Vc,metalnessMap:A,roughnessMap:S,anisotropy:F,anisotropyMap:wt,clearcoat:Y,clearcoatMap:qt,clearcoatNormalMap:nt,clearcoatRoughnessMap:Et,dispersion:J,iridescence:K,iridescenceMap:Ot,iridescenceThicknessMap:Bt,sheen:At,sheenColorMap:bt,sheenRoughnessMap:Yt,specularMap:zt,specularColorMap:oe,specularIntensityMap:D,transmission:ut,transmissionMap:yt,thicknessMap:W,gradientMap:Z,opaque:v.transparent===!1&&v.blending===Bi&&v.alphaToCoverage===!1,alphaMap:gt,alphaTest:Mt,alphaHash:Kt,combine:v.combine,mapUv:mt&&f(v.map.channel),aoMapUv:ot&&f(v.aoMap.channel),lightMapUv:rt&&f(v.lightMap.channel),bumpMapUv:tt&&f(v.bumpMap.channel),normalMapUv:lt&&f(v.normalMap.channel),displacementMapUv:Pt&&f(v.displacementMap.channel),emissiveMapUv:xt&&f(v.emissiveMap.channel),metalnessMapUv:A&&f(v.metalnessMap.channel),roughnessMapUv:S&&f(v.roughnessMap.channel),anisotropyMapUv:wt&&f(v.anisotropyMap.channel),clearcoatMapUv:qt&&f(v.clearcoatMap.channel),clearcoatNormalMapUv:nt&&f(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Et&&f(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Ot&&f(v.iridescenceMap.channel),iridescenceThicknessMapUv:Bt&&f(v.iridescenceThicknessMap.channel),sheenColorMapUv:bt&&f(v.sheenColorMap.channel),sheenRoughnessMapUv:Yt&&f(v.sheenRoughnessMap.channel),specularMapUv:zt&&f(v.specularMap.channel),specularColorMapUv:oe&&f(v.specularColorMap.channel),specularIntensityMapUv:D&&f(v.specularIntensityMap.channel),transmissionMapUv:yt&&f(v.transmissionMap.channel),thicknessMapUv:W&&f(v.thicknessMap.channel),alphaMapUv:gt&&f(v.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(lt||F),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!z.attributes.uv&&(mt||gt),fog:!!X,useFog:v.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:d,skinning:k.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Vt,morphTextureStride:Wt,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:He,decodeVideoTexture:mt&&v.map.isVideoTexture===!0&&Jt.getTransfer(v.map.colorSpace)===le,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Fe,flipSided:v.side===De,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:_e&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&v.extensions.multiDraw===!0||ct)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return jt.vertexUv1s=c.has(1),jt.vertexUv2s=c.has(2),jt.vertexUv3s=c.has(3),c.clear(),jt}function M(v){const w=[];if(v.shaderID?w.push(v.shaderID):(w.push(v.customVertexShaderID),w.push(v.customFragmentShaderID)),v.defines!==void 0)for(const O in v.defines)w.push(O),w.push(v.defines[O]);return v.isRawShaderMaterial===!1&&(x(w,v),y(w,v),w.push(i.outputColorSpace)),w.push(v.customProgramCacheKey),w.join()}function x(v,w){v.push(w.precision),v.push(w.outputColorSpace),v.push(w.envMapMode),v.push(w.envMapCubeUVHeight),v.push(w.mapUv),v.push(w.alphaMapUv),v.push(w.lightMapUv),v.push(w.aoMapUv),v.push(w.bumpMapUv),v.push(w.normalMapUv),v.push(w.displacementMapUv),v.push(w.emissiveMapUv),v.push(w.metalnessMapUv),v.push(w.roughnessMapUv),v.push(w.anisotropyMapUv),v.push(w.clearcoatMapUv),v.push(w.clearcoatNormalMapUv),v.push(w.clearcoatRoughnessMapUv),v.push(w.iridescenceMapUv),v.push(w.iridescenceThicknessMapUv),v.push(w.sheenColorMapUv),v.push(w.sheenRoughnessMapUv),v.push(w.specularMapUv),v.push(w.specularColorMapUv),v.push(w.specularIntensityMapUv),v.push(w.transmissionMapUv),v.push(w.thicknessMapUv),v.push(w.combine),v.push(w.fogExp2),v.push(w.sizeAttenuation),v.push(w.morphTargetsCount),v.push(w.morphAttributeCount),v.push(w.numDirLights),v.push(w.numPointLights),v.push(w.numSpotLights),v.push(w.numSpotLightMaps),v.push(w.numHemiLights),v.push(w.numRectAreaLights),v.push(w.numDirLightShadows),v.push(w.numPointLightShadows),v.push(w.numSpotLightShadows),v.push(w.numSpotLightShadowsWithMaps),v.push(w.numLightProbes),v.push(w.shadowMapType),v.push(w.toneMapping),v.push(w.numClippingPlanes),v.push(w.numClipIntersection),v.push(w.depthPacking)}function y(v,w){o.disableAll(),w.supportsVertexTextures&&o.enable(0),w.instancing&&o.enable(1),w.instancingColor&&o.enable(2),w.instancingMorph&&o.enable(3),w.matcap&&o.enable(4),w.envMap&&o.enable(5),w.normalMapObjectSpace&&o.enable(6),w.normalMapTangentSpace&&o.enable(7),w.clearcoat&&o.enable(8),w.iridescence&&o.enable(9),w.alphaTest&&o.enable(10),w.vertexColors&&o.enable(11),w.vertexAlphas&&o.enable(12),w.vertexUv1s&&o.enable(13),w.vertexUv2s&&o.enable(14),w.vertexUv3s&&o.enable(15),w.vertexTangents&&o.enable(16),w.anisotropy&&o.enable(17),w.alphaHash&&o.enable(18),w.batching&&o.enable(19),w.dispersion&&o.enable(20),w.batchingColor&&o.enable(21),v.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reverseDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.alphaToCoverage&&o.enable(20),v.push(o.mask)}function L(v){const w=_[v.type];let O;if(w){const B=gn[w];O=ws.clone(B.uniforms)}else O=v.uniforms;return O}function R(v,w){let O;for(let B=0,k=h.length;B<k;B++){const X=h[B];if(X.cacheKey===w){O=X,++O.usedTimes;break}}return O===void 0&&(O=new Hm(i,w,v,r),h.push(O)),O}function b(v){if(--v.usedTimes===0){const w=h.indexOf(v);h[w]=h[h.length-1],h.pop(),v.destroy()}}function P(v){l.remove(v)}function N(){l.dispose()}return{getParameters:m,getProgramCacheKey:M,getUniforms:L,acquireProgram:R,releaseProgram:b,releaseShaderCache:P,programs:h,dispose:N}}function Km(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function $m(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function zl(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Vl(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,d,p,g,_,f){let m=i[t];return m===void 0?(m={id:u.id,object:u,geometry:d,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:f},i[t]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=p,m.groupOrder=g,m.renderOrder=u.renderOrder,m.z=_,m.group=f),t++,m}function o(u,d,p,g,_,f){const m=a(u,d,p,g,_,f);p.transmission>0?n.push(m):p.transparent===!0?s.push(m):e.push(m)}function l(u,d,p,g,_,f){const m=a(u,d,p,g,_,f);p.transmission>0?n.unshift(m):p.transparent===!0?s.unshift(m):e.unshift(m)}function c(u,d){e.length>1&&e.sort(u||$m),n.length>1&&n.sort(d||zl),s.length>1&&s.sort(d||zl)}function h(){for(let u=t,d=i.length;u<d;u++){const p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function jm(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new Vl,i.set(n,[a])):s>=r.length?(a=new Vl,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function Jm(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new T,color:new Ut};break;case"SpotLight":e={position:new T,direction:new T,color:new Ut,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new T,color:new Ut,distance:0,decay:0};break;case"HemisphereLight":e={direction:new T,skyColor:new Ut,groundColor:new Ut};break;case"RectAreaLight":e={color:new Ut,position:new T,halfWidth:new T,halfHeight:new T};break}return i[t.id]=e,e}}}function Zm(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Qm=0;function t0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function e0(i){const t=new Jm,e=Zm(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new T);const s=new T,r=new ne,a=new ne;function o(c){let h=0,u=0,d=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let p=0,g=0,_=0,f=0,m=0,M=0,x=0,y=0,L=0,R=0,b=0;c.sort(t0);for(let N=0,v=c.length;N<v;N++){const w=c[N],O=w.color,B=w.intensity,k=w.distance,X=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)h+=O.r*B,u+=O.g*B,d+=O.b*B;else if(w.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(w.sh.coefficients[z],B);b++}else if(w.isDirectionalLight){const z=t.get(w);if(z.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const j=w.shadow,H=e.get(w);H.shadowIntensity=j.intensity,H.shadowBias=j.bias,H.shadowNormalBias=j.normalBias,H.shadowRadius=j.radius,H.shadowMapSize=j.mapSize,n.directionalShadow[p]=H,n.directionalShadowMap[p]=X,n.directionalShadowMatrix[p]=w.shadow.matrix,M++}n.directional[p]=z,p++}else if(w.isSpotLight){const z=t.get(w);z.position.setFromMatrixPosition(w.matrixWorld),z.color.copy(O).multiplyScalar(B),z.distance=k,z.coneCos=Math.cos(w.angle),z.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),z.decay=w.decay,n.spot[_]=z;const j=w.shadow;if(w.map&&(n.spotLightMap[L]=w.map,L++,j.updateMatrices(w),w.castShadow&&R++),n.spotLightMatrix[_]=j.matrix,w.castShadow){const H=e.get(w);H.shadowIntensity=j.intensity,H.shadowBias=j.bias,H.shadowNormalBias=j.normalBias,H.shadowRadius=j.radius,H.shadowMapSize=j.mapSize,n.spotShadow[_]=H,n.spotShadowMap[_]=X,y++}_++}else if(w.isRectAreaLight){const z=t.get(w);z.color.copy(O).multiplyScalar(B),z.halfWidth.set(w.width*.5,0,0),z.halfHeight.set(0,w.height*.5,0),n.rectArea[f]=z,f++}else if(w.isPointLight){const z=t.get(w);if(z.color.copy(w.color).multiplyScalar(w.intensity),z.distance=w.distance,z.decay=w.decay,w.castShadow){const j=w.shadow,H=e.get(w);H.shadowIntensity=j.intensity,H.shadowBias=j.bias,H.shadowNormalBias=j.normalBias,H.shadowRadius=j.radius,H.shadowMapSize=j.mapSize,H.shadowCameraNear=j.camera.near,H.shadowCameraFar=j.camera.far,n.pointShadow[g]=H,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=w.shadow.matrix,x++}n.point[g]=z,g++}else if(w.isHemisphereLight){const z=t.get(w);z.skyColor.copy(w.color).multiplyScalar(B),z.groundColor.copy(w.groundColor).multiplyScalar(B),n.hemi[m]=z,m++}}f>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=dt.LTC_FLOAT_1,n.rectAreaLTC2=dt.LTC_FLOAT_2):(n.rectAreaLTC1=dt.LTC_HALF_1,n.rectAreaLTC2=dt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==p||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==f||P.hemiLength!==m||P.numDirectionalShadows!==M||P.numPointShadows!==x||P.numSpotShadows!==y||P.numSpotMaps!==L||P.numLightProbes!==b)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=f,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=y+L-R,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=b,P.directionalLength=p,P.pointLength=g,P.spotLength=_,P.rectAreaLength=f,P.hemiLength=m,P.numDirectionalShadows=M,P.numPointShadows=x,P.numSpotShadows=y,P.numSpotMaps=L,P.numLightProbes=b,n.version=Qm++)}function l(c,h){let u=0,d=0,p=0,g=0,_=0;const f=h.matrixWorldInverse;for(let m=0,M=c.length;m<M;m++){const x=c[m];if(x.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(f),u++}else if(x.isSpotLight){const y=n.spot[p];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(f),y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(f),p++}else if(x.isRectAreaLight){const y=n.rectArea[g];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(f),a.identity(),r.copy(x.matrixWorld),r.premultiply(f),a.extractRotation(r),y.halfWidth.set(x.width*.5,0,0),y.halfHeight.set(0,x.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(x.isPointLight){const y=n.point[d];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(f),d++}else if(x.isHemisphereLight){const y=n.hemi[_];y.direction.setFromMatrixPosition(x.matrixWorld),y.direction.transformDirection(f),_++}}}return{setup:o,setupView:l,state:n}}function Gl(i){const t=new e0(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function n0(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new Gl(i),t.set(s,[o])):r>=a.length?(o=new Gl(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class i0 extends di{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class s0 extends di{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const r0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,a0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function o0(i,t,e){let n=new Do;const s=new Q,r=new Q,a=new re,o=new i0({depthPacking:Qh}),l=new s0,c={},h=e.maxTextureSize,u={[Un]:De,[De]:Un,[Fe]:Fe},d=new he({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q},radius:{value:4}},vertexShader:r0,fragmentShader:a0}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const g=new we;g.setAttribute("position",new Be(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new it(g,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ec;let m=this.type;this.render=function(R,b,P){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||R.length===0)return;const N=i.getRenderTarget(),v=i.getActiveCubeFace(),w=i.getActiveMipmapLevel(),O=i.state;O.setBlending(Ln),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const B=m!==Cn&&this.type===Cn,k=m===Cn&&this.type!==Cn;for(let X=0,z=R.length;X<z;X++){const j=R[X],H=j.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);const at=H.getFrameExtents();if(s.multiply(at),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/at.x),s.x=r.x*at.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/at.y),s.y=r.y*at.y,H.mapSize.y=r.y)),H.map===null||B===!0||k===!0){const pt=this.type!==Cn?{minFilter:Ye,magFilter:Ye}:{};H.map!==null&&H.map.dispose(),H.map=new pn(s.x,s.y,pt),H.map.texture.name=j.name+".shadowMap",H.camera.updateProjectionMatrix()}i.setRenderTarget(H.map),i.clear();const ft=H.getViewportCount();for(let pt=0;pt<ft;pt++){const Vt=H.getViewport(pt);a.set(r.x*Vt.x,r.y*Vt.y,r.x*Vt.z,r.y*Vt.w),O.viewport(a),H.updateMatrices(j,pt),n=H.getFrustum(),y(b,P,H.camera,j,this.type)}H.isPointLightShadow!==!0&&this.type===Cn&&M(H,P),H.needsUpdate=!1}m=this.type,f.needsUpdate=!1,i.setRenderTarget(N,v,w)};function M(R,b){const P=t.update(_);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,p.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new pn(s.x,s.y)),d.uniforms.shadow_pass.value=R.map.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(b,null,P,d,_,null),p.uniforms.shadow_pass.value=R.mapPass.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(b,null,P,p,_,null)}function x(R,b,P,N){let v=null;const w=P.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(w!==void 0)v=w;else if(v=P.isPointLight===!0?l:o,i.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0){const O=v.uuid,B=b.uuid;let k=c[O];k===void 0&&(k={},c[O]=k);let X=k[B];X===void 0&&(X=v.clone(),k[B]=X,b.addEventListener("dispose",L)),v=X}if(v.visible=b.visible,v.wireframe=b.wireframe,N===Cn?v.side=b.shadowSide!==null?b.shadowSide:b.side:v.side=b.shadowSide!==null?b.shadowSide:u[b.side],v.alphaMap=b.alphaMap,v.alphaTest=b.alphaTest,v.map=b.map,v.clipShadows=b.clipShadows,v.clippingPlanes=b.clippingPlanes,v.clipIntersection=b.clipIntersection,v.displacementMap=b.displacementMap,v.displacementScale=b.displacementScale,v.displacementBias=b.displacementBias,v.wireframeLinewidth=b.wireframeLinewidth,v.linewidth=b.linewidth,P.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const O=i.properties.get(v);O.light=P}return v}function y(R,b,P,N,v){if(R.visible===!1)return;if(R.layers.test(b.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&v===Cn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,R.matrixWorld);const B=t.update(R),k=R.material;if(Array.isArray(k)){const X=B.groups;for(let z=0,j=X.length;z<j;z++){const H=X[z],at=k[H.materialIndex];if(at&&at.visible){const ft=x(R,at,N,v);R.onBeforeShadow(i,R,b,P,B,ft,H),i.renderBufferDirect(P,null,B,ft,R,H),R.onAfterShadow(i,R,b,P,B,ft,H)}}}else if(k.visible){const X=x(R,k,N,v);R.onBeforeShadow(i,R,b,P,B,X,null),i.renderBufferDirect(P,null,B,X,R,null),R.onAfterShadow(i,R,b,P,B,X,null)}}const O=R.children;for(let B=0,k=O.length;B<k;B++)y(O[B],b,P,N,v)}function L(R){R.target.removeEventListener("dispose",L);for(const P in c){const N=c[P],v=R.target.uuid;v in N&&(N[v].dispose(),delete N[v])}}}const l0={[Ca]:Ra,[Pa]:Ia,[La]:Ua,[Gi]:Da,[Ra]:Ca,[Ia]:Pa,[Ua]:La,[Da]:Gi};function c0(i){function t(){let D=!1;const yt=new re;let W=null;const Z=new re(0,0,0,0);return{setMask:function(gt){W!==gt&&!D&&(i.colorMask(gt,gt,gt,gt),W=gt)},setLocked:function(gt){D=gt},setClear:function(gt,Mt,Kt,_e,He){He===!0&&(gt*=_e,Mt*=_e,Kt*=_e),yt.set(gt,Mt,Kt,_e),Z.equals(yt)===!1&&(i.clearColor(gt,Mt,Kt,_e),Z.copy(yt))},reset:function(){D=!1,W=null,Z.set(-1,0,0,0)}}}function e(){let D=!1,yt=!1,W=null,Z=null,gt=null;return{setReversed:function(Mt){yt=Mt},setTest:function(Mt){Mt?St(i.DEPTH_TEST):ht(i.DEPTH_TEST)},setMask:function(Mt){W!==Mt&&!D&&(i.depthMask(Mt),W=Mt)},setFunc:function(Mt){if(yt&&(Mt=l0[Mt]),Z!==Mt){switch(Mt){case Ca:i.depthFunc(i.NEVER);break;case Ra:i.depthFunc(i.ALWAYS);break;case Pa:i.depthFunc(i.LESS);break;case Gi:i.depthFunc(i.LEQUAL);break;case La:i.depthFunc(i.EQUAL);break;case Da:i.depthFunc(i.GEQUAL);break;case Ia:i.depthFunc(i.GREATER);break;case Ua:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Z=Mt}},setLocked:function(Mt){D=Mt},setClear:function(Mt){gt!==Mt&&(i.clearDepth(Mt),gt=Mt)},reset:function(){D=!1,W=null,Z=null,gt=null}}}function n(){let D=!1,yt=null,W=null,Z=null,gt=null,Mt=null,Kt=null,_e=null,He=null;return{setTest:function(jt){D||(jt?St(i.STENCIL_TEST):ht(i.STENCIL_TEST))},setMask:function(jt){yt!==jt&&!D&&(i.stencilMask(jt),yt=jt)},setFunc:function(jt,We,Mn){(W!==jt||Z!==We||gt!==Mn)&&(i.stencilFunc(jt,We,Mn),W=jt,Z=We,gt=Mn)},setOp:function(jt,We,Mn){(Mt!==jt||Kt!==We||_e!==Mn)&&(i.stencilOp(jt,We,Mn),Mt=jt,Kt=We,_e=Mn)},setLocked:function(jt){D=jt},setClear:function(jt){He!==jt&&(i.clearStencil(jt),He=jt)},reset:function(){D=!1,yt=null,W=null,Z=null,gt=null,Mt=null,Kt=null,_e=null,He=null}}}const s=new t,r=new e,a=new n,o=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,d=[],p=null,g=!1,_=null,f=null,m=null,M=null,x=null,y=null,L=null,R=new Ut(0,0,0),b=0,P=!1,N=null,v=null,w=null,O=null,B=null;const k=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,z=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(j)[1]),X=z>=1):j.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),X=z>=2);let H=null,at={};const ft=i.getParameter(i.SCISSOR_BOX),pt=i.getParameter(i.VIEWPORT),Vt=new re().fromArray(ft),Wt=new re().fromArray(pt);function q(D,yt,W,Z){const gt=new Uint8Array(4),Mt=i.createTexture();i.bindTexture(D,Mt),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Kt=0;Kt<W;Kt++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(yt,0,i.RGBA,1,1,Z,0,i.RGBA,i.UNSIGNED_BYTE,gt):i.texImage2D(yt+Kt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,gt);return Mt}const et={};et[i.TEXTURE_2D]=q(i.TEXTURE_2D,i.TEXTURE_2D,1),et[i.TEXTURE_CUBE_MAP]=q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[i.TEXTURE_2D_ARRAY]=q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),et[i.TEXTURE_3D]=q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),a.setClear(0),St(i.DEPTH_TEST),r.setFunc(Gi),rt(!1),tt(Zo),St(i.CULL_FACE),C(Ln);function St(D){c[D]!==!0&&(i.enable(D),c[D]=!0)}function ht(D){c[D]!==!1&&(i.disable(D),c[D]=!1)}function It(D,yt){return h[D]!==yt?(i.bindFramebuffer(D,yt),h[D]=yt,D===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=yt),D===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=yt),!0):!1}function Dt(D,yt){let W=d,Z=!1;if(D){W=u.get(yt),W===void 0&&(W=[],u.set(yt,W));const gt=D.textures;if(W.length!==gt.length||W[0]!==i.COLOR_ATTACHMENT0){for(let Mt=0,Kt=gt.length;Mt<Kt;Mt++)W[Mt]=i.COLOR_ATTACHMENT0+Mt;W.length=gt.length,Z=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,Z=!0);Z&&i.drawBuffers(W)}function ct(D){return p!==D?(i.useProgram(D),p=D,!0):!1}const mt={[oi]:i.FUNC_ADD,[Lh]:i.FUNC_SUBTRACT,[Dh]:i.FUNC_REVERSE_SUBTRACT};mt[Ih]=i.MIN,mt[Uh]=i.MAX;const $={[Nh]:i.ZERO,[Fh]:i.ONE,[Oh]:i.SRC_COLOR,[Ta]:i.SRC_ALPHA,[Hh]:i.SRC_ALPHA_SATURATE,[Vh]:i.DST_COLOR,[kh]:i.DST_ALPHA,[Bh]:i.ONE_MINUS_SRC_COLOR,[Aa]:i.ONE_MINUS_SRC_ALPHA,[Gh]:i.ONE_MINUS_DST_COLOR,[zh]:i.ONE_MINUS_DST_ALPHA,[Wh]:i.CONSTANT_COLOR,[Xh]:i.ONE_MINUS_CONSTANT_COLOR,[qh]:i.CONSTANT_ALPHA,[Yh]:i.ONE_MINUS_CONSTANT_ALPHA};function C(D,yt,W,Z,gt,Mt,Kt,_e,He,jt){if(D===Ln){g===!0&&(ht(i.BLEND),g=!1);return}if(g===!1&&(St(i.BLEND),g=!0),D!==Ph){if(D!==_||jt!==P){if((f!==oi||x!==oi)&&(i.blendEquation(i.FUNC_ADD),f=oi,x=oi),jt)switch(D){case Bi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Oe:i.blendFunc(i.ONE,i.ONE);break;case Qo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case tl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Bi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Oe:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Qo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case tl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}m=null,M=null,y=null,L=null,R.set(0,0,0),b=0,_=D,P=jt}return}gt=gt||yt,Mt=Mt||W,Kt=Kt||Z,(yt!==f||gt!==x)&&(i.blendEquationSeparate(mt[yt],mt[gt]),f=yt,x=gt),(W!==m||Z!==M||Mt!==y||Kt!==L)&&(i.blendFuncSeparate($[W],$[Z],$[Mt],$[Kt]),m=W,M=Z,y=Mt,L=Kt),(_e.equals(R)===!1||He!==b)&&(i.blendColor(_e.r,_e.g,_e.b,He),R.copy(_e),b=He),_=D,P=!1}function ot(D,yt){D.side===Fe?ht(i.CULL_FACE):St(i.CULL_FACE);let W=D.side===De;yt&&(W=!W),rt(W),D.blending===Bi&&D.transparent===!1?C(Ln):C(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),r.setFunc(D.depthFunc),r.setTest(D.depthTest),r.setMask(D.depthWrite),s.setMask(D.colorWrite);const Z=D.stencilWrite;a.setTest(Z),Z&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Pt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?St(i.SAMPLE_ALPHA_TO_COVERAGE):ht(i.SAMPLE_ALPHA_TO_COVERAGE)}function rt(D){N!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),N=D)}function tt(D){D!==Ah?(St(i.CULL_FACE),D!==v&&(D===Zo?i.cullFace(i.BACK):D===Ch?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ht(i.CULL_FACE),v=D}function lt(D){D!==w&&(X&&i.lineWidth(D),w=D)}function Pt(D,yt,W){D?(St(i.POLYGON_OFFSET_FILL),(O!==yt||B!==W)&&(i.polygonOffset(yt,W),O=yt,B=W)):ht(i.POLYGON_OFFSET_FILL)}function xt(D){D?St(i.SCISSOR_TEST):ht(i.SCISSOR_TEST)}function A(D){D===void 0&&(D=i.TEXTURE0+k-1),H!==D&&(i.activeTexture(D),H=D)}function S(D,yt,W){W===void 0&&(H===null?W=i.TEXTURE0+k-1:W=H);let Z=at[W];Z===void 0&&(Z={type:void 0,texture:void 0},at[W]=Z),(Z.type!==D||Z.texture!==yt)&&(H!==W&&(i.activeTexture(W),H=W),i.bindTexture(D,yt||et[D]),Z.type=D,Z.texture=yt)}function F(){const D=at[H];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function Y(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function J(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function K(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function At(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ut(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function wt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function qt(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function nt(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Et(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ot(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Bt(D){Vt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Vt.copy(D))}function bt(D){Wt.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Wt.copy(D))}function Yt(D,yt){let W=l.get(yt);W===void 0&&(W=new WeakMap,l.set(yt,W));let Z=W.get(D);Z===void 0&&(Z=i.getUniformBlockIndex(yt,D.name),W.set(D,Z))}function zt(D,yt){const Z=l.get(yt).get(D);o.get(yt)!==Z&&(i.uniformBlockBinding(yt,Z,D.__bindingPointIndex),o.set(yt,Z))}function oe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},H=null,at={},h={},u=new WeakMap,d=[],p=null,g=!1,_=null,f=null,m=null,M=null,x=null,y=null,L=null,R=new Ut(0,0,0),b=0,P=!1,N=null,v=null,w=null,O=null,B=null,Vt.set(0,0,i.canvas.width,i.canvas.height),Wt.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),a.reset()}return{buffers:{color:s,depth:r,stencil:a},enable:St,disable:ht,bindFramebuffer:It,drawBuffers:Dt,useProgram:ct,setBlending:C,setMaterial:ot,setFlipSided:rt,setCullFace:tt,setLineWidth:lt,setPolygonOffset:Pt,setScissorTest:xt,activeTexture:A,bindTexture:S,unbindTexture:F,compressedTexImage2D:Y,compressedTexImage3D:J,texImage2D:Et,texImage3D:Ot,updateUBOMapping:Yt,uniformBlockBinding:zt,texStorage2D:qt,texStorage3D:nt,texSubImage2D:K,texSubImage3D:At,compressedTexSubImage2D:ut,compressedTexSubImage3D:wt,scissor:Bt,viewport:bt,reset:oe}}function Hl(i,t,e,n){const s=h0(n);switch(e){case Nc:return i*t;case Oc:return i*t;case Bc:return i*t*2;case Ao:return i*t/s.components*s.byteLength;case Co:return i*t/s.components*s.byteLength;case kc:return i*t*2/s.components*s.byteLength;case Ro:return i*t*2/s.components*s.byteLength;case Fc:return i*t*3/s.components*s.byteLength;case fn:return i*t*4/s.components*s.byteLength;case Po:return i*t*4/s.components*s.byteLength;case ur:case dr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case fr:case pr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ka:case Va:return Math.max(i,16)*Math.max(t,8)/4;case Ba:case za:return Math.max(i,8)*Math.max(t,8)/2;case Ga:case Ha:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Wa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Xa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case qa:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Ya:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ka:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case $a:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ja:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ja:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Za:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Qa:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case to:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case eo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case no:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case io:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case so:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case mr:case ro:case ao:return Math.ceil(i/4)*Math.ceil(t/4)*16;case zc:case oo:return Math.ceil(i/4)*Math.ceil(t/4)*8;case lo:case co:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function h0(i){switch(i){case Nn:case Dc:return{byteLength:1,components:1};case Ss:case Ic:case Dn:return{byteLength:2,components:1};case bo:case To:return{byteLength:2,components:4};case hi:case Eo:case _n:return{byteLength:4,components:1};case Uc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function u0(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Q,h=new WeakMap;let u;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,S){return p?new OffscreenCanvas(A,S):Er("canvas")}function _(A,S,F){let Y=1;const J=xt(A);if((J.width>F||J.height>F)&&(Y=F/Math.max(J.width,J.height)),Y<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const K=Math.floor(Y*J.width),At=Math.floor(Y*J.height);u===void 0&&(u=g(K,At));const ut=S?g(K,At):u;return ut.width=K,ut.height=At,ut.getContext("2d").drawImage(A,0,0,K,At),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+K+"x"+At+")."),ut}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),A;return A}function f(A){return A.generateMipmaps&&A.minFilter!==Ye&&A.minFilter!==tn}function m(A){i.generateMipmap(A)}function M(A,S,F,Y,J=!1){if(A!==null){if(i[A]!==void 0)return i[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let K=S;if(S===i.RED&&(F===i.FLOAT&&(K=i.R32F),F===i.HALF_FLOAT&&(K=i.R16F),F===i.UNSIGNED_BYTE&&(K=i.R8)),S===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.R8UI),F===i.UNSIGNED_SHORT&&(K=i.R16UI),F===i.UNSIGNED_INT&&(K=i.R32UI),F===i.BYTE&&(K=i.R8I),F===i.SHORT&&(K=i.R16I),F===i.INT&&(K=i.R32I)),S===i.RG&&(F===i.FLOAT&&(K=i.RG32F),F===i.HALF_FLOAT&&(K=i.RG16F),F===i.UNSIGNED_BYTE&&(K=i.RG8)),S===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RG8UI),F===i.UNSIGNED_SHORT&&(K=i.RG16UI),F===i.UNSIGNED_INT&&(K=i.RG32UI),F===i.BYTE&&(K=i.RG8I),F===i.SHORT&&(K=i.RG16I),F===i.INT&&(K=i.RG32I)),S===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGB8UI),F===i.UNSIGNED_SHORT&&(K=i.RGB16UI),F===i.UNSIGNED_INT&&(K=i.RGB32UI),F===i.BYTE&&(K=i.RGB8I),F===i.SHORT&&(K=i.RGB16I),F===i.INT&&(K=i.RGB32I)),S===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),F===i.UNSIGNED_INT&&(K=i.RGBA32UI),F===i.BYTE&&(K=i.RGBA8I),F===i.SHORT&&(K=i.RGBA16I),F===i.INT&&(K=i.RGBA32I)),S===i.RGB&&F===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),S===i.RGBA){const At=J?xr:Jt.getTransfer(Y);F===i.FLOAT&&(K=i.RGBA32F),F===i.HALF_FLOAT&&(K=i.RGBA16F),F===i.UNSIGNED_BYTE&&(K=At===le?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function x(A,S){let F;return A?S===null||S===hi||S===qi?F=i.DEPTH24_STENCIL8:S===_n?F=i.DEPTH32F_STENCIL8:S===Ss&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===hi||S===qi?F=i.DEPTH_COMPONENT24:S===_n?F=i.DEPTH_COMPONENT32F:S===Ss&&(F=i.DEPTH_COMPONENT16),F}function y(A,S){return f(A)===!0||A.isFramebufferTexture&&A.minFilter!==Ye&&A.minFilter!==tn?Math.log2(Math.max(S.width,S.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?S.mipmaps.length:1}function L(A){const S=A.target;S.removeEventListener("dispose",L),b(S),S.isVideoTexture&&h.delete(S)}function R(A){const S=A.target;S.removeEventListener("dispose",R),N(S)}function b(A){const S=n.get(A);if(S.__webglInit===void 0)return;const F=A.source,Y=d.get(F);if(Y){const J=Y[S.__cacheKey];J.usedTimes--,J.usedTimes===0&&P(A),Object.keys(Y).length===0&&d.delete(F)}n.remove(A)}function P(A){const S=n.get(A);i.deleteTexture(S.__webglTexture);const F=A.source,Y=d.get(F);delete Y[S.__cacheKey],a.memory.textures--}function N(A){const S=n.get(A);if(A.depthTexture&&A.depthTexture.dispose(),A.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(S.__webglFramebuffer[Y]))for(let J=0;J<S.__webglFramebuffer[Y].length;J++)i.deleteFramebuffer(S.__webglFramebuffer[Y][J]);else i.deleteFramebuffer(S.__webglFramebuffer[Y]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[Y])}else{if(Array.isArray(S.__webglFramebuffer))for(let Y=0;Y<S.__webglFramebuffer.length;Y++)i.deleteFramebuffer(S.__webglFramebuffer[Y]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let Y=0;Y<S.__webglColorRenderbuffer.length;Y++)S.__webglColorRenderbuffer[Y]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[Y]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const F=A.textures;for(let Y=0,J=F.length;Y<J;Y++){const K=n.get(F[Y]);K.__webglTexture&&(i.deleteTexture(K.__webglTexture),a.memory.textures--),n.remove(F[Y])}n.remove(A)}let v=0;function w(){v=0}function O(){const A=v;return A>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),v+=1,A}function B(A){const S=[];return S.push(A.wrapS),S.push(A.wrapT),S.push(A.wrapR||0),S.push(A.magFilter),S.push(A.minFilter),S.push(A.anisotropy),S.push(A.internalFormat),S.push(A.format),S.push(A.type),S.push(A.generateMipmaps),S.push(A.premultiplyAlpha),S.push(A.flipY),S.push(A.unpackAlignment),S.push(A.colorSpace),S.join()}function k(A,S){const F=n.get(A);if(A.isVideoTexture&&lt(A),A.isRenderTargetTexture===!1&&A.version>0&&F.__version!==A.version){const Y=A.image;if(Y===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Wt(F,A,S);return}}e.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+S)}function X(A,S){const F=n.get(A);if(A.version>0&&F.__version!==A.version){Wt(F,A,S);return}e.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+S)}function z(A,S){const F=n.get(A);if(A.version>0&&F.__version!==A.version){Wt(F,A,S);return}e.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+S)}function j(A,S){const F=n.get(A);if(A.version>0&&F.__version!==A.version){q(F,A,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+S)}const H={[Xi]:i.REPEAT,[qn]:i.CLAMP_TO_EDGE,[Oa]:i.MIRRORED_REPEAT},at={[Ye]:i.NEAREST,[Jh]:i.NEAREST_MIPMAP_NEAREST,[Is]:i.NEAREST_MIPMAP_LINEAR,[tn]:i.LINEAR,[Br]:i.LINEAR_MIPMAP_NEAREST,[ci]:i.LINEAR_MIPMAP_LINEAR},ft={[eu]:i.NEVER,[ou]:i.ALWAYS,[nu]:i.LESS,[Gc]:i.LEQUAL,[iu]:i.EQUAL,[au]:i.GEQUAL,[su]:i.GREATER,[ru]:i.NOTEQUAL};function pt(A,S){if(S.type===_n&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===tn||S.magFilter===Br||S.magFilter===Is||S.magFilter===ci||S.minFilter===tn||S.minFilter===Br||S.minFilter===Is||S.minFilter===ci)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,H[S.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,H[S.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,H[S.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,at[S.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,at[S.minFilter]),S.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,ft[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Ye||S.minFilter!==Is&&S.minFilter!==ci||S.type===_n&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const F=t.get("EXT_texture_filter_anisotropic");i.texParameterf(A,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Vt(A,S){let F=!1;A.__webglInit===void 0&&(A.__webglInit=!0,S.addEventListener("dispose",L));const Y=S.source;let J=d.get(Y);J===void 0&&(J={},d.set(Y,J));const K=B(S);if(K!==A.__cacheKey){J[K]===void 0&&(J[K]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),J[K].usedTimes++;const At=J[A.__cacheKey];At!==void 0&&(J[A.__cacheKey].usedTimes--,At.usedTimes===0&&P(S)),A.__cacheKey=K,A.__webglTexture=J[K].texture}return F}function Wt(A,S,F){let Y=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(Y=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(Y=i.TEXTURE_3D);const J=Vt(A,S),K=S.source;e.bindTexture(Y,A.__webglTexture,i.TEXTURE0+F);const At=n.get(K);if(K.version!==At.__version||J===!0){e.activeTexture(i.TEXTURE0+F);const ut=Jt.getPrimaries(Jt.workingColorSpace),wt=S.colorSpace===Xn?null:Jt.getPrimaries(S.colorSpace),qt=S.colorSpace===Xn||ut===wt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,qt);let nt=_(S.image,!1,s.maxTextureSize);nt=Pt(S,nt);const Et=r.convert(S.format,S.colorSpace),Ot=r.convert(S.type);let Bt=M(S.internalFormat,Et,Ot,S.colorSpace,S.isVideoTexture);pt(Y,S);let bt;const Yt=S.mipmaps,zt=S.isVideoTexture!==!0,oe=At.__version===void 0||J===!0,D=K.dataReady,yt=y(S,nt);if(S.isDepthTexture)Bt=x(S.format===Yi,S.type),oe&&(zt?e.texStorage2D(i.TEXTURE_2D,1,Bt,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,Bt,nt.width,nt.height,0,Et,Ot,null));else if(S.isDataTexture)if(Yt.length>0){zt&&oe&&e.texStorage2D(i.TEXTURE_2D,yt,Bt,Yt[0].width,Yt[0].height);for(let W=0,Z=Yt.length;W<Z;W++)bt=Yt[W],zt?D&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,bt.width,bt.height,Et,Ot,bt.data):e.texImage2D(i.TEXTURE_2D,W,Bt,bt.width,bt.height,0,Et,Ot,bt.data);S.generateMipmaps=!1}else zt?(oe&&e.texStorage2D(i.TEXTURE_2D,yt,Bt,nt.width,nt.height),D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,nt.width,nt.height,Et,Ot,nt.data)):e.texImage2D(i.TEXTURE_2D,0,Bt,nt.width,nt.height,0,Et,Ot,nt.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){zt&&oe&&e.texStorage3D(i.TEXTURE_2D_ARRAY,yt,Bt,Yt[0].width,Yt[0].height,nt.depth);for(let W=0,Z=Yt.length;W<Z;W++)if(bt=Yt[W],S.format!==fn)if(Et!==null)if(zt){if(D)if(S.layerUpdates.size>0){const gt=Hl(bt.width,bt.height,S.format,S.type);for(const Mt of S.layerUpdates){const Kt=bt.data.subarray(Mt*gt/bt.data.BYTES_PER_ELEMENT,(Mt+1)*gt/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,Mt,bt.width,bt.height,1,Et,Kt,0,0)}S.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,nt.depth,Et,bt.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,W,Bt,bt.width,bt.height,nt.depth,0,bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else zt?D&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,nt.depth,Et,Ot,bt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,W,Bt,bt.width,bt.height,nt.depth,0,Et,Ot,bt.data)}else{zt&&oe&&e.texStorage2D(i.TEXTURE_2D,yt,Bt,Yt[0].width,Yt[0].height);for(let W=0,Z=Yt.length;W<Z;W++)bt=Yt[W],S.format!==fn?Et!==null?zt?D&&e.compressedTexSubImage2D(i.TEXTURE_2D,W,0,0,bt.width,bt.height,Et,bt.data):e.compressedTexImage2D(i.TEXTURE_2D,W,Bt,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):zt?D&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,bt.width,bt.height,Et,Ot,bt.data):e.texImage2D(i.TEXTURE_2D,W,Bt,bt.width,bt.height,0,Et,Ot,bt.data)}else if(S.isDataArrayTexture)if(zt){if(oe&&e.texStorage3D(i.TEXTURE_2D_ARRAY,yt,Bt,nt.width,nt.height,nt.depth),D)if(S.layerUpdates.size>0){const W=Hl(nt.width,nt.height,S.format,S.type);for(const Z of S.layerUpdates){const gt=nt.data.subarray(Z*W/nt.data.BYTES_PER_ELEMENT,(Z+1)*W/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,nt.width,nt.height,1,Et,Ot,gt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,Et,Ot,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Bt,nt.width,nt.height,nt.depth,0,Et,Ot,nt.data);else if(S.isData3DTexture)zt?(oe&&e.texStorage3D(i.TEXTURE_3D,yt,Bt,nt.width,nt.height,nt.depth),D&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,Et,Ot,nt.data)):e.texImage3D(i.TEXTURE_3D,0,Bt,nt.width,nt.height,nt.depth,0,Et,Ot,nt.data);else if(S.isFramebufferTexture){if(oe)if(zt)e.texStorage2D(i.TEXTURE_2D,yt,Bt,nt.width,nt.height);else{let W=nt.width,Z=nt.height;for(let gt=0;gt<yt;gt++)e.texImage2D(i.TEXTURE_2D,gt,Bt,W,Z,0,Et,Ot,null),W>>=1,Z>>=1}}else if(Yt.length>0){if(zt&&oe){const W=xt(Yt[0]);e.texStorage2D(i.TEXTURE_2D,yt,Bt,W.width,W.height)}for(let W=0,Z=Yt.length;W<Z;W++)bt=Yt[W],zt?D&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,Et,Ot,bt):e.texImage2D(i.TEXTURE_2D,W,Bt,Et,Ot,bt);S.generateMipmaps=!1}else if(zt){if(oe){const W=xt(nt);e.texStorage2D(i.TEXTURE_2D,yt,Bt,W.width,W.height)}D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Et,Ot,nt)}else e.texImage2D(i.TEXTURE_2D,0,Bt,Et,Ot,nt);f(S)&&m(Y),At.__version=K.version,S.onUpdate&&S.onUpdate(S)}A.__version=S.version}function q(A,S,F){if(S.image.length!==6)return;const Y=Vt(A,S),J=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+F);const K=n.get(J);if(J.version!==K.__version||Y===!0){e.activeTexture(i.TEXTURE0+F);const At=Jt.getPrimaries(Jt.workingColorSpace),ut=S.colorSpace===Xn?null:Jt.getPrimaries(S.colorSpace),wt=S.colorSpace===Xn||At===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,wt);const qt=S.isCompressedTexture||S.image[0].isCompressedTexture,nt=S.image[0]&&S.image[0].isDataTexture,Et=[];for(let Z=0;Z<6;Z++)!qt&&!nt?Et[Z]=_(S.image[Z],!0,s.maxCubemapSize):Et[Z]=nt?S.image[Z].image:S.image[Z],Et[Z]=Pt(S,Et[Z]);const Ot=Et[0],Bt=r.convert(S.format,S.colorSpace),bt=r.convert(S.type),Yt=M(S.internalFormat,Bt,bt,S.colorSpace),zt=S.isVideoTexture!==!0,oe=K.__version===void 0||Y===!0,D=J.dataReady;let yt=y(S,Ot);pt(i.TEXTURE_CUBE_MAP,S);let W;if(qt){zt&&oe&&e.texStorage2D(i.TEXTURE_CUBE_MAP,yt,Yt,Ot.width,Ot.height);for(let Z=0;Z<6;Z++){W=Et[Z].mipmaps;for(let gt=0;gt<W.length;gt++){const Mt=W[gt];S.format!==fn?Bt!==null?zt?D&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt,0,0,Mt.width,Mt.height,Bt,Mt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt,Yt,Mt.width,Mt.height,0,Mt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):zt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt,0,0,Mt.width,Mt.height,Bt,bt,Mt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt,Yt,Mt.width,Mt.height,0,Bt,bt,Mt.data)}}}else{if(W=S.mipmaps,zt&&oe){W.length>0&&yt++;const Z=xt(Et[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,yt,Yt,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(nt){zt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Et[Z].width,Et[Z].height,Bt,bt,Et[Z].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Yt,Et[Z].width,Et[Z].height,0,Bt,bt,Et[Z].data);for(let gt=0;gt<W.length;gt++){const Kt=W[gt].image[Z].image;zt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt+1,0,0,Kt.width,Kt.height,Bt,bt,Kt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt+1,Yt,Kt.width,Kt.height,0,Bt,bt,Kt.data)}}else{zt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Bt,bt,Et[Z]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Yt,Bt,bt,Et[Z]);for(let gt=0;gt<W.length;gt++){const Mt=W[gt];zt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt+1,0,0,Bt,bt,Mt.image[Z]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,gt+1,Yt,Bt,bt,Mt.image[Z])}}}f(S)&&m(i.TEXTURE_CUBE_MAP),K.__version=J.version,S.onUpdate&&S.onUpdate(S)}A.__version=S.version}function et(A,S,F,Y,J,K){const At=r.convert(F.format,F.colorSpace),ut=r.convert(F.type),wt=M(F.internalFormat,At,ut,F.colorSpace);if(!n.get(S).__hasExternalTextures){const nt=Math.max(1,S.width>>K),Et=Math.max(1,S.height>>K);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?e.texImage3D(J,K,wt,nt,Et,S.depth,0,At,ut,null):e.texImage2D(J,K,wt,nt,Et,0,At,ut,null)}e.bindFramebuffer(i.FRAMEBUFFER,A),tt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Y,J,n.get(F).__webglTexture,0,rt(S)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Y,J,n.get(F).__webglTexture,K),e.bindFramebuffer(i.FRAMEBUFFER,null)}function St(A,S,F){if(i.bindRenderbuffer(i.RENDERBUFFER,A),S.depthBuffer){const Y=S.depthTexture,J=Y&&Y.isDepthTexture?Y.type:null,K=x(S.stencilBuffer,J),At=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ut=rt(S);tt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ut,K,S.width,S.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ut,K,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,K,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,At,i.RENDERBUFFER,A)}else{const Y=S.textures;for(let J=0;J<Y.length;J++){const K=Y[J],At=r.convert(K.format,K.colorSpace),ut=r.convert(K.type),wt=M(K.internalFormat,At,ut,K.colorSpace),qt=rt(S);F&&tt(S)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,qt,wt,S.width,S.height):tt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qt,wt,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,wt,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ht(A,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,A),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(S.depthTexture).__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),k(S.depthTexture,0);const Y=n.get(S.depthTexture).__webglTexture,J=rt(S);if(S.depthTexture.format===ki)tt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0);else if(S.depthTexture.format===Yi)tt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0);else throw new Error("Unknown depthTexture format")}function It(A){const S=n.get(A),F=A.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==A.depthTexture){const Y=A.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),Y){const J=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,Y.removeEventListener("dispose",J)};Y.addEventListener("dispose",J),S.__depthDisposeCallback=J}S.__boundDepthTexture=Y}if(A.depthTexture&&!S.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");ht(S.__webglFramebuffer,A)}else if(F){S.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[Y]),S.__webglDepthbuffer[Y]===void 0)S.__webglDepthbuffer[Y]=i.createRenderbuffer(),St(S.__webglDepthbuffer[Y],A,!1);else{const J=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,K=S.__webglDepthbuffer[Y];i.bindRenderbuffer(i.RENDERBUFFER,K),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,K)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),St(S.__webglDepthbuffer,A,!1);else{const Y=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,J=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,J),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,J)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Dt(A,S,F){const Y=n.get(A);S!==void 0&&et(Y.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&It(A)}function ct(A){const S=A.texture,F=n.get(A),Y=n.get(S);A.addEventListener("dispose",R);const J=A.textures,K=A.isWebGLCubeRenderTarget===!0,At=J.length>1;if(At||(Y.__webglTexture===void 0&&(Y.__webglTexture=i.createTexture()),Y.__version=S.version,a.memory.textures++),K){F.__webglFramebuffer=[];for(let ut=0;ut<6;ut++)if(S.mipmaps&&S.mipmaps.length>0){F.__webglFramebuffer[ut]=[];for(let wt=0;wt<S.mipmaps.length;wt++)F.__webglFramebuffer[ut][wt]=i.createFramebuffer()}else F.__webglFramebuffer[ut]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){F.__webglFramebuffer=[];for(let ut=0;ut<S.mipmaps.length;ut++)F.__webglFramebuffer[ut]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(At)for(let ut=0,wt=J.length;ut<wt;ut++){const qt=n.get(J[ut]);qt.__webglTexture===void 0&&(qt.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&tt(A)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ut=0;ut<J.length;ut++){const wt=J[ut];F.__webglColorRenderbuffer[ut]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[ut]);const qt=r.convert(wt.format,wt.colorSpace),nt=r.convert(wt.type),Et=M(wt.internalFormat,qt,nt,wt.colorSpace,A.isXRRenderTarget===!0),Ot=rt(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ot,Et,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,F.__webglColorRenderbuffer[ut])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),St(F.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(K){e.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),pt(i.TEXTURE_CUBE_MAP,S);for(let ut=0;ut<6;ut++)if(S.mipmaps&&S.mipmaps.length>0)for(let wt=0;wt<S.mipmaps.length;wt++)et(F.__webglFramebuffer[ut][wt],A,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,wt);else et(F.__webglFramebuffer[ut],A,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0);f(S)&&m(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(At){for(let ut=0,wt=J.length;ut<wt;ut++){const qt=J[ut],nt=n.get(qt);e.bindTexture(i.TEXTURE_2D,nt.__webglTexture),pt(i.TEXTURE_2D,qt),et(F.__webglFramebuffer,A,qt,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,0),f(qt)&&m(i.TEXTURE_2D)}e.unbindTexture()}else{let ut=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ut=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ut,Y.__webglTexture),pt(ut,S),S.mipmaps&&S.mipmaps.length>0)for(let wt=0;wt<S.mipmaps.length;wt++)et(F.__webglFramebuffer[wt],A,S,i.COLOR_ATTACHMENT0,ut,wt);else et(F.__webglFramebuffer,A,S,i.COLOR_ATTACHMENT0,ut,0);f(S)&&m(ut),e.unbindTexture()}A.depthBuffer&&It(A)}function mt(A){const S=A.textures;for(let F=0,Y=S.length;F<Y;F++){const J=S[F];if(f(J)){const K=A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,At=n.get(J).__webglTexture;e.bindTexture(K,At),m(K),e.unbindTexture()}}}const $=[],C=[];function ot(A){if(A.samples>0){if(tt(A)===!1){const S=A.textures,F=A.width,Y=A.height;let J=i.COLOR_BUFFER_BIT;const K=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,At=n.get(A),ut=S.length>1;if(ut)for(let wt=0;wt<S.length;wt++)e.bindFramebuffer(i.FRAMEBUFFER,At.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,At.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,At.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglFramebuffer);for(let wt=0;wt<S.length;wt++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),ut){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,At.__webglColorRenderbuffer[wt]);const qt=n.get(S[wt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,qt,0)}i.blitFramebuffer(0,0,F,Y,0,0,F,Y,J,i.NEAREST),l===!0&&($.length=0,C.length=0,$.push(i.COLOR_ATTACHMENT0+wt),A.depthBuffer&&A.resolveDepthBuffer===!1&&($.push(K),C.push(K),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,C)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,$))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ut)for(let wt=0;wt<S.length;wt++){e.bindFramebuffer(i.FRAMEBUFFER,At.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.RENDERBUFFER,At.__webglColorRenderbuffer[wt]);const qt=n.get(S[wt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,At.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.TEXTURE_2D,qt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const S=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function rt(A){return Math.min(s.maxSamples,A.samples)}function tt(A){const S=n.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function lt(A){const S=a.render.frame;h.get(A)!==S&&(h.set(A,S),A.update())}function Pt(A,S){const F=A.colorSpace,Y=A.format,J=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||F!==$n&&F!==Xn&&(Jt.getTransfer(F)===le?(Y!==fn||J!==Nn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),S}function xt(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=w,this.setTexture2D=k,this.setTexture2DArray=X,this.setTexture3D=z,this.setTextureCube=j,this.rebindTextures=Dt,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=mt,this.updateMultisampleRenderTarget=ot,this.setupDepthRenderbuffer=It,this.setupFrameBufferTexture=et,this.useMultisampledRTT=tt}function d0(i,t){function e(n,s=Xn){let r;const a=Jt.getTransfer(s);if(n===Nn)return i.UNSIGNED_BYTE;if(n===bo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===To)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Uc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Dc)return i.BYTE;if(n===Ic)return i.SHORT;if(n===Ss)return i.UNSIGNED_SHORT;if(n===Eo)return i.INT;if(n===hi)return i.UNSIGNED_INT;if(n===_n)return i.FLOAT;if(n===Dn)return i.HALF_FLOAT;if(n===Nc)return i.ALPHA;if(n===Fc)return i.RGB;if(n===fn)return i.RGBA;if(n===Oc)return i.LUMINANCE;if(n===Bc)return i.LUMINANCE_ALPHA;if(n===ki)return i.DEPTH_COMPONENT;if(n===Yi)return i.DEPTH_STENCIL;if(n===Ao)return i.RED;if(n===Co)return i.RED_INTEGER;if(n===kc)return i.RG;if(n===Ro)return i.RG_INTEGER;if(n===Po)return i.RGBA_INTEGER;if(n===ur||n===dr||n===fr||n===pr)if(a===le)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ur)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===fr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===pr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ur)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===dr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===fr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===pr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ba||n===ka||n===za||n===Va)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ba)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ka)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===za)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Va)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ga||n===Ha||n===Wa)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ga||n===Ha)return a===le?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Wa)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Xa||n===qa||n===Ya||n===Ka||n===$a||n===ja||n===Ja||n===Za||n===Qa||n===to||n===eo||n===no||n===io||n===so)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Xa)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===qa)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ya)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ka)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===$a)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ja)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ja)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Za)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Qa)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===to)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===eo)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===no)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===io)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===so)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===mr||n===ro||n===ao)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===mr)return a===le?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ro)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ao)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===zc||n===oo||n===lo||n===co)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===mr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===oo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===lo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===co)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===qi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class f0 extends Qe{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class de extends Ce{constructor(){super(),this.isGroup=!0,this.type="Group"}}const p0={type:"move"};class pa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new de,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new de,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new de,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const _ of t.hand.values()){const f=e.getJointPose(_,n),m=this._getHandJoint(c,_);f!==null&&(m.matrix.fromArray(f.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=f.radius),m.visible=f!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(p0)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new de;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const m0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,g0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class v0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new ke,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new he({vertexShader:m0,fragmentShader:g0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new it(new Fn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class _0 extends Ji{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,g=null;const _=new v0,f=e.getContextAttributes();let m=null,M=null;const x=[],y=[],L=new Q;let R=null;const b=new Qe;b.layers.enable(1),b.viewport=new re;const P=new Qe;P.layers.enable(2),P.viewport=new re;const N=[b,P],v=new f0;v.layers.enable(1),v.layers.enable(2);let w=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let et=x[q];return et===void 0&&(et=new pa,x[q]=et),et.getTargetRaySpace()},this.getControllerGrip=function(q){let et=x[q];return et===void 0&&(et=new pa,x[q]=et),et.getGripSpace()},this.getHand=function(q){let et=x[q];return et===void 0&&(et=new pa,x[q]=et),et.getHandSpace()};function B(q){const et=y.indexOf(q.inputSource);if(et===-1)return;const St=x[et];St!==void 0&&(St.update(q.inputSource,q.frame,c||a),St.dispatchEvent({type:q.type,data:q.inputSource}))}function k(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",X);for(let q=0;q<x.length;q++){const et=y[q];et!==null&&(y[q]=null,x[q].disconnect(et))}w=null,O=null,_.reset(),t.setRenderTarget(m),p=null,d=null,u=null,s=null,M=null,Wt.stop(),n.isPresenting=!1,t.setPixelRatio(R),t.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",k),s.addEventListener("inputsourceschange",X),f.xrCompatible!==!0&&await e.makeXRCompatible(),R=t.getPixelRatio(),t.getSize(L),s.renderState.layers===void 0){const et={antialias:f.antialias,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),M=new pn(p.framebufferWidth,p.framebufferHeight,{format:fn,type:Nn,colorSpace:t.outputColorSpace,stencilBuffer:f.stencil})}else{let et=null,St=null,ht=null;f.depth&&(ht=f.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=f.stencil?Yi:ki,St=f.stencil?qi:hi);const It={colorFormat:e.RGBA8,depthFormat:ht,scaleFactor:r};u=new XRWebGLBinding(s,e),d=u.createProjectionLayer(It),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),M=new pn(d.textureWidth,d.textureHeight,{format:fn,type:Nn,depthTexture:new eh(d.textureWidth,d.textureHeight,St,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:f.stencil,colorSpace:t.outputColorSpace,samples:f.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Wt.setContext(s),Wt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function X(q){for(let et=0;et<q.removed.length;et++){const St=q.removed[et],ht=y.indexOf(St);ht>=0&&(y[ht]=null,x[ht].disconnect(St))}for(let et=0;et<q.added.length;et++){const St=q.added[et];let ht=y.indexOf(St);if(ht===-1){for(let Dt=0;Dt<x.length;Dt++)if(Dt>=y.length){y.push(St),ht=Dt;break}else if(y[Dt]===null){y[Dt]=St,ht=Dt;break}if(ht===-1)break}const It=x[ht];It&&It.connect(St)}}const z=new T,j=new T;function H(q,et,St){z.setFromMatrixPosition(et.matrixWorld),j.setFromMatrixPosition(St.matrixWorld);const ht=z.distanceTo(j),It=et.projectionMatrix.elements,Dt=St.projectionMatrix.elements,ct=It[14]/(It[10]-1),mt=It[14]/(It[10]+1),$=(It[9]+1)/It[5],C=(It[9]-1)/It[5],ot=(It[8]-1)/It[0],rt=(Dt[8]+1)/Dt[0],tt=ct*ot,lt=ct*rt,Pt=ht/(-ot+rt),xt=Pt*-ot;if(et.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(xt),q.translateZ(Pt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),It[10]===-1)q.projectionMatrix.copy(et.projectionMatrix),q.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{const A=ct+Pt,S=mt+Pt,F=tt-xt,Y=lt+(ht-xt),J=$*mt/S*A,K=C*mt/S*A;q.projectionMatrix.makePerspective(F,Y,J,K,A,S),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function at(q,et){et===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(et.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let et=q.near,St=q.far;_.texture!==null&&(_.depthNear>0&&(et=_.depthNear),_.depthFar>0&&(St=_.depthFar)),v.near=P.near=b.near=et,v.far=P.far=b.far=St,(w!==v.near||O!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),w=v.near,O=v.far);const ht=q.parent,It=v.cameras;at(v,ht);for(let Dt=0;Dt<It.length;Dt++)at(It[Dt],ht);It.length===2?H(v,b,P):v.projectionMatrix.copy(b.projectionMatrix),ft(q,v,ht)};function ft(q,et,St){St===null?q.matrix.copy(et.matrixWorld):(q.matrix.copy(St.matrixWorld),q.matrix.invert(),q.matrix.multiply(et.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(et.projectionMatrix),q.projectionMatrixInverse.copy(et.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=ho*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(v)};let pt=null;function Vt(q,et){if(h=et.getViewerPose(c||a),g=et,h!==null){const St=h.views;p!==null&&(t.setRenderTargetFramebuffer(M,p.framebuffer),t.setRenderTarget(M));let ht=!1;St.length!==v.cameras.length&&(v.cameras.length=0,ht=!0);for(let Dt=0;Dt<St.length;Dt++){const ct=St[Dt];let mt=null;if(p!==null)mt=p.getViewport(ct);else{const C=u.getViewSubImage(d,ct);mt=C.viewport,Dt===0&&(t.setRenderTargetTextures(M,C.colorTexture,d.ignoreDepthValues?void 0:C.depthStencilTexture),t.setRenderTarget(M))}let $=N[Dt];$===void 0&&($=new Qe,$.layers.enable(Dt),$.viewport=new re,N[Dt]=$),$.matrix.fromArray(ct.transform.matrix),$.matrix.decompose($.position,$.quaternion,$.scale),$.projectionMatrix.fromArray(ct.projectionMatrix),$.projectionMatrixInverse.copy($.projectionMatrix).invert(),$.viewport.set(mt.x,mt.y,mt.width,mt.height),Dt===0&&(v.matrix.copy($.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),ht===!0&&v.cameras.push($)}const It=s.enabledFeatures;if(It&&It.includes("depth-sensing")){const Dt=u.getDepthInformation(St[0]);Dt&&Dt.isValid&&Dt.texture&&_.init(t,Dt,s.renderState)}}for(let St=0;St<x.length;St++){const ht=y[St],It=x[St];ht!==null&&It!==void 0&&It.update(ht,et,c||a)}pt&&pt(q,et),et.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:et}),g=null}const Wt=new th;Wt.setAnimationLoop(Vt),this.setAnimationLoop=function(q){pt=q},this.dispose=function(){}}}const ii=new an,x0=new ne;function y0(i,t){function e(f,m){f.matrixAutoUpdate===!0&&f.updateMatrix(),m.value.copy(f.matrix)}function n(f,m){m.color.getRGB(f.fogColor.value,Jc(i)),m.isFog?(f.fogNear.value=m.near,f.fogFar.value=m.far):m.isFogExp2&&(f.fogDensity.value=m.density)}function s(f,m,M,x,y){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(f,m):m.isMeshToonMaterial?(r(f,m),u(f,m)):m.isMeshPhongMaterial?(r(f,m),h(f,m)):m.isMeshStandardMaterial?(r(f,m),d(f,m),m.isMeshPhysicalMaterial&&p(f,m,y)):m.isMeshMatcapMaterial?(r(f,m),g(f,m)):m.isMeshDepthMaterial?r(f,m):m.isMeshDistanceMaterial?(r(f,m),_(f,m)):m.isMeshNormalMaterial?r(f,m):m.isLineBasicMaterial?(a(f,m),m.isLineDashedMaterial&&o(f,m)):m.isPointsMaterial?l(f,m,M,x):m.isSpriteMaterial?c(f,m):m.isShadowMaterial?(f.color.value.copy(m.color),f.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(f,m){f.opacity.value=m.opacity,m.color&&f.diffuse.value.copy(m.color),m.emissive&&f.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(f.map.value=m.map,e(m.map,f.mapTransform)),m.alphaMap&&(f.alphaMap.value=m.alphaMap,e(m.alphaMap,f.alphaMapTransform)),m.bumpMap&&(f.bumpMap.value=m.bumpMap,e(m.bumpMap,f.bumpMapTransform),f.bumpScale.value=m.bumpScale,m.side===De&&(f.bumpScale.value*=-1)),m.normalMap&&(f.normalMap.value=m.normalMap,e(m.normalMap,f.normalMapTransform),f.normalScale.value.copy(m.normalScale),m.side===De&&f.normalScale.value.negate()),m.displacementMap&&(f.displacementMap.value=m.displacementMap,e(m.displacementMap,f.displacementMapTransform),f.displacementScale.value=m.displacementScale,f.displacementBias.value=m.displacementBias),m.emissiveMap&&(f.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,f.emissiveMapTransform)),m.specularMap&&(f.specularMap.value=m.specularMap,e(m.specularMap,f.specularMapTransform)),m.alphaTest>0&&(f.alphaTest.value=m.alphaTest);const M=t.get(m),x=M.envMap,y=M.envMapRotation;x&&(f.envMap.value=x,ii.copy(y),ii.x*=-1,ii.y*=-1,ii.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ii.y*=-1,ii.z*=-1),f.envMapRotation.value.setFromMatrix4(x0.makeRotationFromEuler(ii)),f.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=m.reflectivity,f.ior.value=m.ior,f.refractionRatio.value=m.refractionRatio),m.lightMap&&(f.lightMap.value=m.lightMap,f.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,f.lightMapTransform)),m.aoMap&&(f.aoMap.value=m.aoMap,f.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,f.aoMapTransform))}function a(f,m){f.diffuse.value.copy(m.color),f.opacity.value=m.opacity,m.map&&(f.map.value=m.map,e(m.map,f.mapTransform))}function o(f,m){f.dashSize.value=m.dashSize,f.totalSize.value=m.dashSize+m.gapSize,f.scale.value=m.scale}function l(f,m,M,x){f.diffuse.value.copy(m.color),f.opacity.value=m.opacity,f.size.value=m.size*M,f.scale.value=x*.5,m.map&&(f.map.value=m.map,e(m.map,f.uvTransform)),m.alphaMap&&(f.alphaMap.value=m.alphaMap,e(m.alphaMap,f.alphaMapTransform)),m.alphaTest>0&&(f.alphaTest.value=m.alphaTest)}function c(f,m){f.diffuse.value.copy(m.color),f.opacity.value=m.opacity,f.rotation.value=m.rotation,m.map&&(f.map.value=m.map,e(m.map,f.mapTransform)),m.alphaMap&&(f.alphaMap.value=m.alphaMap,e(m.alphaMap,f.alphaMapTransform)),m.alphaTest>0&&(f.alphaTest.value=m.alphaTest)}function h(f,m){f.specular.value.copy(m.specular),f.shininess.value=Math.max(m.shininess,1e-4)}function u(f,m){m.gradientMap&&(f.gradientMap.value=m.gradientMap)}function d(f,m){f.metalness.value=m.metalness,m.metalnessMap&&(f.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,f.metalnessMapTransform)),f.roughness.value=m.roughness,m.roughnessMap&&(f.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,f.roughnessMapTransform)),m.envMap&&(f.envMapIntensity.value=m.envMapIntensity)}function p(f,m,M){f.ior.value=m.ior,m.sheen>0&&(f.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),f.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(f.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,f.sheenColorMapTransform)),m.sheenRoughnessMap&&(f.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,f.sheenRoughnessMapTransform))),m.clearcoat>0&&(f.clearcoat.value=m.clearcoat,f.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(f.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,f.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(f.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===De&&f.clearcoatNormalScale.value.negate())),m.dispersion>0&&(f.dispersion.value=m.dispersion),m.iridescence>0&&(f.iridescence.value=m.iridescence,f.iridescenceIOR.value=m.iridescenceIOR,f.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(f.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,f.iridescenceMapTransform)),m.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),m.transmission>0&&(f.transmission.value=m.transmission,f.transmissionSamplerMap.value=M.texture,f.transmissionSamplerSize.value.set(M.width,M.height),m.transmissionMap&&(f.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,f.transmissionMapTransform)),f.thickness.value=m.thickness,m.thicknessMap&&(f.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=m.attenuationDistance,f.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(f.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(f.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=m.specularIntensity,f.specularColor.value.copy(m.specularColor),m.specularColorMap&&(f.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,f.specularColorMapTransform)),m.specularIntensityMap&&(f.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,m){m.matcap&&(f.matcap.value=m.matcap)}function _(f,m){const M=t.get(m).light;f.referencePosition.value.setFromMatrixPosition(M.matrixWorld),f.nearDistance.value=M.shadow.camera.near,f.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function M0(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,x){const y=x.program;n.uniformBlockBinding(M,y)}function c(M,x){let y=s[M.id];y===void 0&&(g(M),y=h(M),s[M.id]=y,M.addEventListener("dispose",f));const L=x.program;n.updateUBOMapping(M,L);const R=t.render.frame;r[M.id]!==R&&(d(M),r[M.id]=R)}function h(M){const x=u();M.__bindingPointIndex=x;const y=i.createBuffer(),L=M.__size,R=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,L,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,y),y}function u(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){const x=s[M.id],y=M.uniforms,L=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let R=0,b=y.length;R<b;R++){const P=Array.isArray(y[R])?y[R]:[y[R]];for(let N=0,v=P.length;N<v;N++){const w=P[N];if(p(w,R,N,L)===!0){const O=w.__offset,B=Array.isArray(w.value)?w.value:[w.value];let k=0;for(let X=0;X<B.length;X++){const z=B[X],j=_(z);typeof z=="number"||typeof z=="boolean"?(w.__data[0]=z,i.bufferSubData(i.UNIFORM_BUFFER,O+k,w.__data)):z.isMatrix3?(w.__data[0]=z.elements[0],w.__data[1]=z.elements[1],w.__data[2]=z.elements[2],w.__data[3]=0,w.__data[4]=z.elements[3],w.__data[5]=z.elements[4],w.__data[6]=z.elements[5],w.__data[7]=0,w.__data[8]=z.elements[6],w.__data[9]=z.elements[7],w.__data[10]=z.elements[8],w.__data[11]=0):(z.toArray(w.__data,k),k+=j.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,O,w.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(M,x,y,L){const R=M.value,b=x+"_"+y;if(L[b]===void 0)return typeof R=="number"||typeof R=="boolean"?L[b]=R:L[b]=R.clone(),!0;{const P=L[b];if(typeof R=="number"||typeof R=="boolean"){if(P!==R)return L[b]=R,!0}else if(P.equals(R)===!1)return P.copy(R),!0}return!1}function g(M){const x=M.uniforms;let y=0;const L=16;for(let b=0,P=x.length;b<P;b++){const N=Array.isArray(x[b])?x[b]:[x[b]];for(let v=0,w=N.length;v<w;v++){const O=N[v],B=Array.isArray(O.value)?O.value:[O.value];for(let k=0,X=B.length;k<X;k++){const z=B[k],j=_(z),H=y%L,at=H%j.boundary,ft=H+at;y+=at,ft!==0&&L-ft<j.storage&&(y+=L-ft),O.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=y,y+=j.storage}}}const R=y%L;return R>0&&(y+=L-R),M.__size=y,M.__cache={},this}function _(M){const x={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(x.boundary=4,x.storage=4):M.isVector2?(x.boundary=8,x.storage=8):M.isVector3||M.isColor?(x.boundary=16,x.storage=12):M.isVector4?(x.boundary=16,x.storage=16):M.isMatrix3?(x.boundary=48,x.storage=48):M.isMatrix4?(x.boundary=64,x.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),x}function f(M){const x=M.target;x.removeEventListener("dispose",f);const y=a.indexOf(x.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function m(){for(const M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:m}}class S0{constructor(t={}){const{canvas:e=cu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const p=new Uint32Array(4),g=new Int32Array(4);let _=null,f=null;const m=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Xe,this.toneMapping=Yn,this.toneMappingExposure=1;const x=this;let y=!1,L=0,R=0,b=null,P=-1,N=null;const v=new re,w=new re;let O=null;const B=new Ut(0);let k=0,X=e.width,z=e.height,j=1,H=null,at=null;const ft=new re(0,0,X,z),pt=new re(0,0,X,z);let Vt=!1;const Wt=new Do;let q=!1,et=!1;const St=new ne,ht=new ne,It=new T,Dt=new re,ct={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let mt=!1;function $(){return b===null?j:1}let C=n;function ot(E,I){return e.getContext(E,I)}try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${So}`),e.addEventListener("webglcontextlost",Z,!1),e.addEventListener("webglcontextrestored",gt,!1),e.addEventListener("webglcontextcreationerror",Mt,!1),C===null){const I="webgl2";if(C=ot(I,E),C===null)throw ot(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let rt,tt,lt,Pt,xt,A,S,F,Y,J,K,At,ut,wt,qt,nt,Et,Ot,Bt,bt,Yt,zt,oe,D;function yt(){rt=new Ap(C),rt.init(),zt=new d0(C,rt),tt=new Mp(C,rt,t,zt),lt=new c0(C),tt.reverseDepthBuffer&&lt.buffers.depth.setReversed(!0),Pt=new Pp(C),xt=new Km,A=new u0(C,rt,lt,xt,tt,zt,Pt),S=new wp(x),F=new Tp(x),Y=new Fu(C),oe=new xp(C,Y),J=new Cp(C,Y,Pt,oe),K=new Dp(C,J,Y,Pt),Bt=new Lp(C,tt,A),nt=new Sp(xt),At=new Ym(x,S,F,rt,tt,oe,nt),ut=new y0(x,xt),wt=new jm,qt=new n0(rt),Ot=new _p(x,S,F,lt,K,d,l),Et=new o0(x,K,tt),D=new M0(C,Pt,tt,lt),bt=new yp(C,rt,Pt),Yt=new Rp(C,rt,Pt),Pt.programs=At.programs,x.capabilities=tt,x.extensions=rt,x.properties=xt,x.renderLists=wt,x.shadowMap=Et,x.state=lt,x.info=Pt}yt();const W=new _0(x,C);this.xr=W,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const E=rt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=rt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(E){E!==void 0&&(j=E,this.setSize(X,z,!1))},this.getSize=function(E){return E.set(X,z)},this.setSize=function(E,I,V=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=E,z=I,e.width=Math.floor(E*j),e.height=Math.floor(I*j),V===!0&&(e.style.width=E+"px",e.style.height=I+"px"),this.setViewport(0,0,E,I)},this.getDrawingBufferSize=function(E){return E.set(X*j,z*j).floor()},this.setDrawingBufferSize=function(E,I,V){X=E,z=I,j=V,e.width=Math.floor(E*V),e.height=Math.floor(I*V),this.setViewport(0,0,E,I)},this.getCurrentViewport=function(E){return E.copy(v)},this.getViewport=function(E){return E.copy(ft)},this.setViewport=function(E,I,V,G){E.isVector4?ft.set(E.x,E.y,E.z,E.w):ft.set(E,I,V,G),lt.viewport(v.copy(ft).multiplyScalar(j).round())},this.getScissor=function(E){return E.copy(pt)},this.setScissor=function(E,I,V,G){E.isVector4?pt.set(E.x,E.y,E.z,E.w):pt.set(E,I,V,G),lt.scissor(w.copy(pt).multiplyScalar(j).round())},this.getScissorTest=function(){return Vt},this.setScissorTest=function(E){lt.setScissorTest(Vt=E)},this.setOpaqueSort=function(E){H=E},this.setTransparentSort=function(E){at=E},this.getClearColor=function(E){return E.copy(Ot.getClearColor())},this.setClearColor=function(){Ot.setClearColor.apply(Ot,arguments)},this.getClearAlpha=function(){return Ot.getClearAlpha()},this.setClearAlpha=function(){Ot.setClearAlpha.apply(Ot,arguments)},this.clear=function(E=!0,I=!0,V=!0){let G=0;if(E){let U=!1;if(b!==null){const st=b.texture.format;U=st===Po||st===Ro||st===Co}if(U){const st=b.texture.type,vt=st===Nn||st===hi||st===Ss||st===qi||st===bo||st===To,Tt=Ot.getClearColor(),Ct=Ot.getClearAlpha(),Nt=Tt.r,Ft=Tt.g,Rt=Tt.b;vt?(p[0]=Nt,p[1]=Ft,p[2]=Rt,p[3]=Ct,C.clearBufferuiv(C.COLOR,0,p)):(g[0]=Nt,g[1]=Ft,g[2]=Rt,g[3]=Ct,C.clearBufferiv(C.COLOR,0,g))}else G|=C.COLOR_BUFFER_BIT}I&&(G|=C.DEPTH_BUFFER_BIT,C.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),V&&(G|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Z,!1),e.removeEventListener("webglcontextrestored",gt,!1),e.removeEventListener("webglcontextcreationerror",Mt,!1),wt.dispose(),qt.dispose(),xt.dispose(),S.dispose(),F.dispose(),K.dispose(),oe.dispose(),D.dispose(),At.dispose(),W.dispose(),W.removeEventListener("sessionstart",Wo),W.removeEventListener("sessionend",Xo),Jn.stop()};function Z(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),y=!0}function gt(){console.log("THREE.WebGLRenderer: Context Restored."),y=!1;const E=Pt.autoReset,I=Et.enabled,V=Et.autoUpdate,G=Et.needsUpdate,U=Et.type;yt(),Pt.autoReset=E,Et.enabled=I,Et.autoUpdate=V,Et.needsUpdate=G,Et.type=U}function Mt(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Kt(E){const I=E.target;I.removeEventListener("dispose",Kt),_e(I)}function _e(E){He(E),xt.remove(E)}function He(E){const I=xt.get(E).programs;I!==void 0&&(I.forEach(function(V){At.releaseProgram(V)}),E.isShaderMaterial&&At.releaseShaderCache(E))}this.renderBufferDirect=function(E,I,V,G,U,st){I===null&&(I=ct);const vt=U.isMesh&&U.matrixWorld.determinant()<0,Tt=wh(E,I,V,G,U);lt.setMaterial(G,vt);let Ct=V.index,Nt=1;if(G.wireframe===!0){if(Ct=J.getWireframeAttribute(V),Ct===void 0)return;Nt=2}const Ft=V.drawRange,Rt=V.attributes.position;let ee=Ft.start*Nt,ce=(Ft.start+Ft.count)*Nt;st!==null&&(ee=Math.max(ee,st.start*Nt),ce=Math.min(ce,(st.start+st.count)*Nt)),Ct!==null?(ee=Math.max(ee,0),ce=Math.min(ce,Ct.count)):Rt!=null&&(ee=Math.max(ee,0),ce=Math.min(ce,Rt.count));const me=ce-ee;if(me<0||me===1/0)return;oe.setup(U,G,Tt,V,Ct);let $e,Zt=bt;if(Ct!==null&&($e=Y.get(Ct),Zt=Yt,Zt.setIndex($e)),U.isMesh)G.wireframe===!0?(lt.setLineWidth(G.wireframeLinewidth*$()),Zt.setMode(C.LINES)):Zt.setMode(C.TRIANGLES);else if(U.isLine){let Lt=G.linewidth;Lt===void 0&&(Lt=1),lt.setLineWidth(Lt*$()),U.isLineSegments?Zt.setMode(C.LINES):U.isLineLoop?Zt.setMode(C.LINE_LOOP):Zt.setMode(C.LINE_STRIP)}else U.isPoints?Zt.setMode(C.POINTS):U.isSprite&&Zt.setMode(C.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Zt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(rt.get("WEBGL_multi_draw"))Zt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Lt=U._multiDrawStarts,Re=U._multiDrawCounts,Qt=U._multiDrawCount,on=Ct?Y.get(Ct).bytesPerElement:1,pi=xt.get(G).currentProgram.getUniforms();for(let je=0;je<Qt;je++)pi.setValue(C,"_gl_DrawID",je),Zt.render(Lt[je]/on,Re[je])}else if(U.isInstancedMesh)Zt.renderInstances(ee,me,U.count);else if(V.isInstancedBufferGeometry){const Lt=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,Re=Math.min(V.instanceCount,Lt);Zt.renderInstances(ee,me,Re)}else Zt.render(ee,me)};function jt(E,I,V){E.transparent===!0&&E.side===Fe&&E.forceSinglePass===!1?(E.side=De,E.needsUpdate=!0,Ds(E,I,V),E.side=Un,E.needsUpdate=!0,Ds(E,I,V),E.side=Fe):Ds(E,I,V)}this.compile=function(E,I,V=null){V===null&&(V=E),f=qt.get(V),f.init(I),M.push(f),V.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),E!==V&&E.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),f.setupLights();const G=new Set;return E.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const st=U.material;if(st)if(Array.isArray(st))for(let vt=0;vt<st.length;vt++){const Tt=st[vt];jt(Tt,V,U),G.add(Tt)}else jt(st,V,U),G.add(st)}),M.pop(),f=null,G},this.compileAsync=function(E,I,V=null){const G=this.compile(E,I,V);return new Promise(U=>{function st(){if(G.forEach(function(vt){xt.get(vt).currentProgram.isReady()&&G.delete(vt)}),G.size===0){U(E);return}setTimeout(st,10)}rt.get("KHR_parallel_shader_compile")!==null?st():setTimeout(st,10)})};let We=null;function Mn(E){We&&We(E)}function Wo(){Jn.stop()}function Xo(){Jn.start()}const Jn=new th;Jn.setAnimationLoop(Mn),typeof self<"u"&&Jn.setContext(self),this.setAnimationLoop=function(E){We=E,W.setAnimationLoop(E),E===null?Jn.stop():Jn.start()},W.addEventListener("sessionstart",Wo),W.addEventListener("sessionend",Xo),this.render=function(E,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(I),I=W.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,I,b),f=qt.get(E,M.length),f.init(I),M.push(f),ht.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),Wt.setFromProjectionMatrix(ht),et=this.localClippingEnabled,q=nt.init(this.clippingPlanes,et),_=wt.get(E,m.length),_.init(),m.push(_),W.enabled===!0&&W.isPresenting===!0){const st=x.xr.getDepthSensingMesh();st!==null&&Ur(st,I,-1/0,x.sortObjects)}Ur(E,I,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(H,at),mt=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,mt&&Ot.addToRenderList(_,E),this.info.render.frame++,q===!0&&nt.beginShadows();const V=f.state.shadowsArray;Et.render(V,E,I),q===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=_.opaque,U=_.transmissive;if(f.setupLights(),I.isArrayCamera){const st=I.cameras;if(U.length>0)for(let vt=0,Tt=st.length;vt<Tt;vt++){const Ct=st[vt];Yo(G,U,E,Ct)}mt&&Ot.render(E);for(let vt=0,Tt=st.length;vt<Tt;vt++){const Ct=st[vt];qo(_,E,Ct,Ct.viewport)}}else U.length>0&&Yo(G,U,E,I),mt&&Ot.render(E),qo(_,E,I);b!==null&&(A.updateMultisampleRenderTarget(b),A.updateRenderTargetMipmap(b)),E.isScene===!0&&E.onAfterRender(x,E,I),oe.resetDefaultState(),P=-1,N=null,M.pop(),M.length>0?(f=M[M.length-1],q===!0&&nt.setGlobalState(x.clippingPlanes,f.state.camera)):f=null,m.pop(),m.length>0?_=m[m.length-1]:_=null};function Ur(E,I,V,G){if(E.visible===!1)return;if(E.layers.test(I.layers)){if(E.isGroup)V=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(I);else if(E.isLight)f.pushLight(E),E.castShadow&&f.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Wt.intersectsSprite(E)){G&&Dt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ht);const vt=K.update(E),Tt=E.material;Tt.visible&&_.push(E,vt,Tt,V,Dt.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Wt.intersectsObject(E))){const vt=K.update(E),Tt=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Dt.copy(E.boundingSphere.center)):(vt.boundingSphere===null&&vt.computeBoundingSphere(),Dt.copy(vt.boundingSphere.center)),Dt.applyMatrix4(E.matrixWorld).applyMatrix4(ht)),Array.isArray(Tt)){const Ct=vt.groups;for(let Nt=0,Ft=Ct.length;Nt<Ft;Nt++){const Rt=Ct[Nt],ee=Tt[Rt.materialIndex];ee&&ee.visible&&_.push(E,vt,ee,V,Dt.z,Rt)}}else Tt.visible&&_.push(E,vt,Tt,V,Dt.z,null)}}const st=E.children;for(let vt=0,Tt=st.length;vt<Tt;vt++)Ur(st[vt],I,V,G)}function qo(E,I,V,G){const U=E.opaque,st=E.transmissive,vt=E.transparent;f.setupLightsView(V),q===!0&&nt.setGlobalState(x.clippingPlanes,V),G&&lt.viewport(v.copy(G)),U.length>0&&Ls(U,I,V),st.length>0&&Ls(st,I,V),vt.length>0&&Ls(vt,I,V),lt.buffers.depth.setTest(!0),lt.buffers.depth.setMask(!0),lt.buffers.color.setMask(!0),lt.setPolygonOffset(!1)}function Yo(E,I,V,G){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[G.id]===void 0&&(f.state.transmissionRenderTarget[G.id]=new pn(1,1,{generateMipmaps:!0,type:rt.has("EXT_color_buffer_half_float")||rt.has("EXT_color_buffer_float")?Dn:Nn,minFilter:ci,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Jt.workingColorSpace}));const st=f.state.transmissionRenderTarget[G.id],vt=G.viewport||v;st.setSize(vt.z,vt.w);const Tt=x.getRenderTarget();x.setRenderTarget(st),x.getClearColor(B),k=x.getClearAlpha(),k<1&&x.setClearColor(16777215,.5),x.clear(),mt&&Ot.render(V);const Ct=x.toneMapping;x.toneMapping=Yn;const Nt=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),f.setupLightsView(G),q===!0&&nt.setGlobalState(x.clippingPlanes,G),Ls(E,V,G),A.updateMultisampleRenderTarget(st),A.updateRenderTargetMipmap(st),rt.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let Rt=0,ee=I.length;Rt<ee;Rt++){const ce=I[Rt],me=ce.object,$e=ce.geometry,Zt=ce.material,Lt=ce.group;if(Zt.side===Fe&&me.layers.test(G.layers)){const Re=Zt.side;Zt.side=De,Zt.needsUpdate=!0,Ko(me,V,G,$e,Zt,Lt),Zt.side=Re,Zt.needsUpdate=!0,Ft=!0}}Ft===!0&&(A.updateMultisampleRenderTarget(st),A.updateRenderTargetMipmap(st))}x.setRenderTarget(Tt),x.setClearColor(B,k),Nt!==void 0&&(G.viewport=Nt),x.toneMapping=Ct}function Ls(E,I,V){const G=I.isScene===!0?I.overrideMaterial:null;for(let U=0,st=E.length;U<st;U++){const vt=E[U],Tt=vt.object,Ct=vt.geometry,Nt=G===null?vt.material:G,Ft=vt.group;Tt.layers.test(V.layers)&&Ko(Tt,I,V,Ct,Nt,Ft)}}function Ko(E,I,V,G,U,st){E.onBeforeRender(x,I,V,G,U,st),E.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),U.onBeforeRender(x,I,V,G,E,st),U.transparent===!0&&U.side===Fe&&U.forceSinglePass===!1?(U.side=De,U.needsUpdate=!0,x.renderBufferDirect(V,I,G,U,E,st),U.side=Un,U.needsUpdate=!0,x.renderBufferDirect(V,I,G,U,E,st),U.side=Fe):x.renderBufferDirect(V,I,G,U,E,st),E.onAfterRender(x,I,V,G,U,st)}function Ds(E,I,V){I.isScene!==!0&&(I=ct);const G=xt.get(E),U=f.state.lights,st=f.state.shadowsArray,vt=U.state.version,Tt=At.getParameters(E,U.state,st,I,V),Ct=At.getProgramCacheKey(Tt);let Nt=G.programs;G.environment=E.isMeshStandardMaterial?I.environment:null,G.fog=I.fog,G.envMap=(E.isMeshStandardMaterial?F:S).get(E.envMap||G.environment),G.envMapRotation=G.environment!==null&&E.envMap===null?I.environmentRotation:E.envMapRotation,Nt===void 0&&(E.addEventListener("dispose",Kt),Nt=new Map,G.programs=Nt);let Ft=Nt.get(Ct);if(Ft!==void 0){if(G.currentProgram===Ft&&G.lightsStateVersion===vt)return jo(E,Tt),Ft}else Tt.uniforms=At.getUniforms(E),E.onBeforeCompile(Tt,x),Ft=At.acquireProgram(Tt,Ct),Nt.set(Ct,Ft),G.uniforms=Tt.uniforms;const Rt=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Rt.clippingPlanes=nt.uniform),jo(E,Tt),G.needsLights=bh(E),G.lightsStateVersion=vt,G.needsLights&&(Rt.ambientLightColor.value=U.state.ambient,Rt.lightProbe.value=U.state.probe,Rt.directionalLights.value=U.state.directional,Rt.directionalLightShadows.value=U.state.directionalShadow,Rt.spotLights.value=U.state.spot,Rt.spotLightShadows.value=U.state.spotShadow,Rt.rectAreaLights.value=U.state.rectArea,Rt.ltc_1.value=U.state.rectAreaLTC1,Rt.ltc_2.value=U.state.rectAreaLTC2,Rt.pointLights.value=U.state.point,Rt.pointLightShadows.value=U.state.pointShadow,Rt.hemisphereLights.value=U.state.hemi,Rt.directionalShadowMap.value=U.state.directionalShadowMap,Rt.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Rt.spotShadowMap.value=U.state.spotShadowMap,Rt.spotLightMatrix.value=U.state.spotLightMatrix,Rt.spotLightMap.value=U.state.spotLightMap,Rt.pointShadowMap.value=U.state.pointShadowMap,Rt.pointShadowMatrix.value=U.state.pointShadowMatrix),G.currentProgram=Ft,G.uniformsList=null,Ft}function $o(E){if(E.uniformsList===null){const I=E.currentProgram.getUniforms();E.uniformsList=vr.seqWithValue(I.seq,E.uniforms)}return E.uniformsList}function jo(E,I){const V=xt.get(E);V.outputColorSpace=I.outputColorSpace,V.batching=I.batching,V.batchingColor=I.batchingColor,V.instancing=I.instancing,V.instancingColor=I.instancingColor,V.instancingMorph=I.instancingMorph,V.skinning=I.skinning,V.morphTargets=I.morphTargets,V.morphNormals=I.morphNormals,V.morphColors=I.morphColors,V.morphTargetsCount=I.morphTargetsCount,V.numClippingPlanes=I.numClippingPlanes,V.numIntersection=I.numClipIntersection,V.vertexAlphas=I.vertexAlphas,V.vertexTangents=I.vertexTangents,V.toneMapping=I.toneMapping}function wh(E,I,V,G,U){I.isScene!==!0&&(I=ct),A.resetTextureUnits();const st=I.fog,vt=G.isMeshStandardMaterial?I.environment:null,Tt=b===null?x.outputColorSpace:b.isXRRenderTarget===!0?b.texture.colorSpace:$n,Ct=(G.isMeshStandardMaterial?F:S).get(G.envMap||vt),Nt=G.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Ft=!!V.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Rt=!!V.morphAttributes.position,ee=!!V.morphAttributes.normal,ce=!!V.morphAttributes.color;let me=Yn;G.toneMapped&&(b===null||b.isXRRenderTarget===!0)&&(me=x.toneMapping);const $e=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Zt=$e!==void 0?$e.length:0,Lt=xt.get(G),Re=f.state.lights;if(q===!0&&(et===!0||E!==N)){const en=E===N&&G.id===P;nt.setState(G,E,en)}let Qt=!1;G.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==Re.state.version||Lt.outputColorSpace!==Tt||U.isBatchedMesh&&Lt.batching===!1||!U.isBatchedMesh&&Lt.batching===!0||U.isBatchedMesh&&Lt.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Lt.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Lt.instancing===!1||!U.isInstancedMesh&&Lt.instancing===!0||U.isSkinnedMesh&&Lt.skinning===!1||!U.isSkinnedMesh&&Lt.skinning===!0||U.isInstancedMesh&&Lt.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Lt.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Lt.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Lt.instancingMorph===!1&&U.morphTexture!==null||Lt.envMap!==Ct||G.fog===!0&&Lt.fog!==st||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==nt.numPlanes||Lt.numIntersection!==nt.numIntersection)||Lt.vertexAlphas!==Nt||Lt.vertexTangents!==Ft||Lt.morphTargets!==Rt||Lt.morphNormals!==ee||Lt.morphColors!==ce||Lt.toneMapping!==me||Lt.morphTargetsCount!==Zt)&&(Qt=!0):(Qt=!0,Lt.__version=G.version);let on=Lt.currentProgram;Qt===!0&&(on=Ds(G,I,U));let pi=!1,je=!1,Nr=!1;const ve=on.getUniforms(),On=Lt.uniforms;if(lt.useProgram(on.program)&&(pi=!0,je=!0,Nr=!0),G.id!==P&&(P=G.id,je=!0),pi||N!==E){tt.reverseDepthBuffer?(St.copy(E.projectionMatrix),uu(St),du(St),ve.setValue(C,"projectionMatrix",St)):ve.setValue(C,"projectionMatrix",E.projectionMatrix),ve.setValue(C,"viewMatrix",E.matrixWorldInverse);const en=ve.map.cameraPosition;en!==void 0&&en.setValue(C,It.setFromMatrixPosition(E.matrixWorld)),tt.logarithmicDepthBuffer&&ve.setValue(C,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ve.setValue(C,"isOrthographic",E.isOrthographicCamera===!0),N!==E&&(N=E,je=!0,Nr=!0)}if(U.isSkinnedMesh){ve.setOptional(C,U,"bindMatrix"),ve.setOptional(C,U,"bindMatrixInverse");const en=U.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),ve.setValue(C,"boneTexture",en.boneTexture,A))}U.isBatchedMesh&&(ve.setOptional(C,U,"batchingTexture"),ve.setValue(C,"batchingTexture",U._matricesTexture,A),ve.setOptional(C,U,"batchingIdTexture"),ve.setValue(C,"batchingIdTexture",U._indirectTexture,A),ve.setOptional(C,U,"batchingColorTexture"),U._colorsTexture!==null&&ve.setValue(C,"batchingColorTexture",U._colorsTexture,A));const Fr=V.morphAttributes;if((Fr.position!==void 0||Fr.normal!==void 0||Fr.color!==void 0)&&Bt.update(U,V,on),(je||Lt.receiveShadow!==U.receiveShadow)&&(Lt.receiveShadow=U.receiveShadow,ve.setValue(C,"receiveShadow",U.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(On.envMap.value=Ct,On.flipEnvMap.value=Ct.isCubeTexture&&Ct.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&I.environment!==null&&(On.envMapIntensity.value=I.environmentIntensity),je&&(ve.setValue(C,"toneMappingExposure",x.toneMappingExposure),Lt.needsLights&&Eh(On,Nr),st&&G.fog===!0&&ut.refreshFogUniforms(On,st),ut.refreshMaterialUniforms(On,G,j,z,f.state.transmissionRenderTarget[E.id]),vr.upload(C,$o(Lt),On,A)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(vr.upload(C,$o(Lt),On,A),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ve.setValue(C,"center",U.center),ve.setValue(C,"modelViewMatrix",U.modelViewMatrix),ve.setValue(C,"normalMatrix",U.normalMatrix),ve.setValue(C,"modelMatrix",U.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const en=G.uniformsGroups;for(let Or=0,Th=en.length;Or<Th;Or++){const Jo=en[Or];D.update(Jo,on),D.bind(Jo,on)}}return on}function Eh(E,I){E.ambientLightColor.needsUpdate=I,E.lightProbe.needsUpdate=I,E.directionalLights.needsUpdate=I,E.directionalLightShadows.needsUpdate=I,E.pointLights.needsUpdate=I,E.pointLightShadows.needsUpdate=I,E.spotLights.needsUpdate=I,E.spotLightShadows.needsUpdate=I,E.rectAreaLights.needsUpdate=I,E.hemisphereLights.needsUpdate=I}function bh(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return b},this.setRenderTargetTextures=function(E,I,V){xt.get(E.texture).__webglTexture=I,xt.get(E.depthTexture).__webglTexture=V;const G=xt.get(E);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=V===void 0,G.__autoAllocateDepthBuffer||rt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,I){const V=xt.get(E);V.__webglFramebuffer=I,V.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(E,I=0,V=0){b=E,L=I,R=V;let G=!0,U=null,st=!1,vt=!1;if(E){const Ct=xt.get(E);if(Ct.__useDefaultFramebuffer!==void 0)lt.bindFramebuffer(C.FRAMEBUFFER,null),G=!1;else if(Ct.__webglFramebuffer===void 0)A.setupRenderTarget(E);else if(Ct.__hasExternalTextures)A.rebindTextures(E,xt.get(E.texture).__webglTexture,xt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Rt=E.depthTexture;if(Ct.__boundDepthTexture!==Rt){if(Rt!==null&&xt.has(Rt)&&(E.width!==Rt.image.width||E.height!==Rt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");A.setupDepthRenderbuffer(E)}}const Nt=E.texture;(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)&&(vt=!0);const Ft=xt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Ft[I])?U=Ft[I][V]:U=Ft[I],st=!0):E.samples>0&&A.useMultisampledRTT(E)===!1?U=xt.get(E).__webglMultisampledFramebuffer:Array.isArray(Ft)?U=Ft[V]:U=Ft,v.copy(E.viewport),w.copy(E.scissor),O=E.scissorTest}else v.copy(ft).multiplyScalar(j).floor(),w.copy(pt).multiplyScalar(j).floor(),O=Vt;if(lt.bindFramebuffer(C.FRAMEBUFFER,U)&&G&&lt.drawBuffers(E,U),lt.viewport(v),lt.scissor(w),lt.setScissorTest(O),st){const Ct=xt.get(E.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+I,Ct.__webglTexture,V)}else if(vt){const Ct=xt.get(E.texture),Nt=I||0;C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,Ct.__webglTexture,V||0,Nt)}P=-1},this.readRenderTargetPixels=function(E,I,V,G,U,st,vt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Tt=xt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&vt!==void 0&&(Tt=Tt[vt]),Tt){lt.bindFramebuffer(C.FRAMEBUFFER,Tt);try{const Ct=E.texture,Nt=Ct.format,Ft=Ct.type;if(!tt.textureFormatReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!tt.textureTypeReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=E.width-G&&V>=0&&V<=E.height-U&&C.readPixels(I,V,G,U,zt.convert(Nt),zt.convert(Ft),st)}finally{const Ct=b!==null?xt.get(b).__webglFramebuffer:null;lt.bindFramebuffer(C.FRAMEBUFFER,Ct)}}},this.readRenderTargetPixelsAsync=async function(E,I,V,G,U,st,vt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Tt=xt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&vt!==void 0&&(Tt=Tt[vt]),Tt){const Ct=E.texture,Nt=Ct.format,Ft=Ct.type;if(!tt.textureFormatReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!tt.textureTypeReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(I>=0&&I<=E.width-G&&V>=0&&V<=E.height-U){lt.bindFramebuffer(C.FRAMEBUFFER,Tt);const Rt=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,Rt),C.bufferData(C.PIXEL_PACK_BUFFER,st.byteLength,C.STREAM_READ),C.readPixels(I,V,G,U,zt.convert(Nt),zt.convert(Ft),0);const ee=b!==null?xt.get(b).__webglFramebuffer:null;lt.bindFramebuffer(C.FRAMEBUFFER,ee);const ce=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await hu(C,ce,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,Rt),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,st),C.deleteBuffer(Rt),C.deleteSync(ce),st}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,I=null,V=0){E.isTexture!==!0&&(gr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),I=arguments[0]||null,E=arguments[1]);const G=Math.pow(2,-V),U=Math.floor(E.image.width*G),st=Math.floor(E.image.height*G),vt=I!==null?I.x:0,Tt=I!==null?I.y:0;A.setTexture2D(E,0),C.copyTexSubImage2D(C.TEXTURE_2D,V,0,0,vt,Tt,U,st),lt.unbindTexture()},this.copyTextureToTexture=function(E,I,V=null,G=null,U=0){E.isTexture!==!0&&(gr("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,E=arguments[1],I=arguments[2],U=arguments[3]||0,V=null);let st,vt,Tt,Ct,Nt,Ft;V!==null?(st=V.max.x-V.min.x,vt=V.max.y-V.min.y,Tt=V.min.x,Ct=V.min.y):(st=E.image.width,vt=E.image.height,Tt=0,Ct=0),G!==null?(Nt=G.x,Ft=G.y):(Nt=0,Ft=0);const Rt=zt.convert(I.format),ee=zt.convert(I.type);A.setTexture2D(I,0),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,I.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,I.unpackAlignment);const ce=C.getParameter(C.UNPACK_ROW_LENGTH),me=C.getParameter(C.UNPACK_IMAGE_HEIGHT),$e=C.getParameter(C.UNPACK_SKIP_PIXELS),Zt=C.getParameter(C.UNPACK_SKIP_ROWS),Lt=C.getParameter(C.UNPACK_SKIP_IMAGES),Re=E.isCompressedTexture?E.mipmaps[U]:E.image;C.pixelStorei(C.UNPACK_ROW_LENGTH,Re.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,Re.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Tt),C.pixelStorei(C.UNPACK_SKIP_ROWS,Ct),E.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,U,Nt,Ft,st,vt,Rt,ee,Re.data):E.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,U,Nt,Ft,Re.width,Re.height,Rt,Re.data):C.texSubImage2D(C.TEXTURE_2D,U,Nt,Ft,st,vt,Rt,ee,Re),C.pixelStorei(C.UNPACK_ROW_LENGTH,ce),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,me),C.pixelStorei(C.UNPACK_SKIP_PIXELS,$e),C.pixelStorei(C.UNPACK_SKIP_ROWS,Zt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Lt),U===0&&I.generateMipmaps&&C.generateMipmap(C.TEXTURE_2D),lt.unbindTexture()},this.copyTextureToTexture3D=function(E,I,V=null,G=null,U=0){E.isTexture!==!0&&(gr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),V=arguments[0]||null,G=arguments[1]||null,E=arguments[2],I=arguments[3],U=arguments[4]||0);let st,vt,Tt,Ct,Nt,Ft,Rt,ee,ce;const me=E.isCompressedTexture?E.mipmaps[U]:E.image;V!==null?(st=V.max.x-V.min.x,vt=V.max.y-V.min.y,Tt=V.max.z-V.min.z,Ct=V.min.x,Nt=V.min.y,Ft=V.min.z):(st=me.width,vt=me.height,Tt=me.depth,Ct=0,Nt=0,Ft=0),G!==null?(Rt=G.x,ee=G.y,ce=G.z):(Rt=0,ee=0,ce=0);const $e=zt.convert(I.format),Zt=zt.convert(I.type);let Lt;if(I.isData3DTexture)A.setTexture3D(I,0),Lt=C.TEXTURE_3D;else if(I.isDataArrayTexture||I.isCompressedArrayTexture)A.setTexture2DArray(I,0),Lt=C.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,I.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,I.unpackAlignment);const Re=C.getParameter(C.UNPACK_ROW_LENGTH),Qt=C.getParameter(C.UNPACK_IMAGE_HEIGHT),on=C.getParameter(C.UNPACK_SKIP_PIXELS),pi=C.getParameter(C.UNPACK_SKIP_ROWS),je=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,me.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,me.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ct),C.pixelStorei(C.UNPACK_SKIP_ROWS,Nt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Ft),E.isDataTexture||E.isData3DTexture?C.texSubImage3D(Lt,U,Rt,ee,ce,st,vt,Tt,$e,Zt,me.data):I.isCompressedArrayTexture?C.compressedTexSubImage3D(Lt,U,Rt,ee,ce,st,vt,Tt,$e,me.data):C.texSubImage3D(Lt,U,Rt,ee,ce,st,vt,Tt,$e,Zt,me),C.pixelStorei(C.UNPACK_ROW_LENGTH,Re),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,Qt),C.pixelStorei(C.UNPACK_SKIP_PIXELS,on),C.pixelStorei(C.UNPACK_SKIP_ROWS,pi),C.pixelStorei(C.UNPACK_SKIP_IMAGES,je),U===0&&I.generateMipmaps&&C.generateMipmap(Lt),lt.unbindTexture()},this.initRenderTarget=function(E){xt.get(E).__webglFramebuffer===void 0&&A.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?A.setTextureCube(E,0):E.isData3DTexture?A.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?A.setTexture2DArray(E,0):A.setTexture2D(E,0),lt.unbindTexture()},this.resetState=function(){L=0,R=0,b=null,lt.reset(),oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Pn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===Lo?"display-p3":"srgb",e.unpackColorSpace=Jt.workingColorSpace===Pr?"display-p3":"srgb"}}class ah extends Ce{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new an,this.environmentIntensity=1,this.environmentRotation=new an,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class w0{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Sr,this.updateRanges=[],this.version=0,this.uuid=In()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=In()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=In()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const ze=new T;class br{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyMatrix4(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyNormalMatrix(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.transformDirection(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=vn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=se(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=vn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=vn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=vn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=vn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array),r=se(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Be(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new br(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class E0 extends di{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ut(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Ri;const as=new T,Pi=new T,Li=new T,Di=new Q,os=new Q,oh=new ne,tr=new T,ls=new T,er=new T,Wl=new Q,ma=new Q,Xl=new Q;class b0 extends Ce{constructor(t=new E0){if(super(),this.isSprite=!0,this.type="Sprite",Ri===void 0){Ri=new we;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new w0(e,5);Ri.setIndex([0,1,2,0,2,3]),Ri.setAttribute("position",new br(n,3,0,!1)),Ri.setAttribute("uv",new br(n,2,3,!1))}this.geometry=Ri,this.material=t,this.center=new Q(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Pi.setFromMatrixScale(this.matrixWorld),oh.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Li.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Pi.multiplyScalar(-Li.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;nr(tr.set(-.5,-.5,0),Li,a,Pi,s,r),nr(ls.set(.5,-.5,0),Li,a,Pi,s,r),nr(er.set(.5,.5,0),Li,a,Pi,s,r),Wl.set(0,0),ma.set(1,0),Xl.set(1,1);let o=t.ray.intersectTriangle(tr,ls,er,!1,as);if(o===null&&(nr(ls.set(-.5,.5,0),Li,a,Pi,s,r),ma.set(0,1),o=t.ray.intersectTriangle(tr,er,ls,!1,as),o===null))return;const l=t.ray.origin.distanceTo(as);l<t.near||l>t.far||e.push({distance:l,point:as.clone(),uv:sn.getInterpolation(as,tr,ls,er,Wl,ma,Xl,new Q),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function nr(i,t,e,n,s,r){Di.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(os.x=r*Di.x-s*Di.y,os.y=s*Di.x+r*Di.y):os.copy(Di),i.copy(t),i.x+=os.x,i.y+=os.y,i.applyMatrix4(oh)}class T0 extends ke{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Ye,h=Ye,u,d){super(null,a,o,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ql extends Be{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Ii=new ne,Yl=new ne,ir=[],Kl=new jn,A0=new ne,cs=new it,hs=new Zi;class C0 extends it{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new ql(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,A0)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new jn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ii),Kl.copy(t.boundingBox).applyMatrix4(Ii),this.boundingBox.union(Kl)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Zi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ii),hs.copy(t.boundingSphere).applyMatrix4(Ii),this.boundingSphere.union(hs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(cs.geometry=this.geometry,cs.material=this.material,cs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),hs.copy(this.boundingSphere),hs.applyMatrix4(n),t.ray.intersectsSphere(hs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ii),Yl.multiplyMatrices(n,Ii),cs.matrixWorld=Yl,cs.raycast(t,ir);for(let a=0,o=ir.length;a<o;a++){const l=ir[a];l.instanceId=r,l.object=this,e.push(l)}ir.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new ql(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new T0(new Float32Array(s*this.count),s,this.count,Ao,_n));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class lh extends di{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ut(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const $l=new ne,fo=new qc,sr=new Zi,rr=new T;class jl extends Ce{constructor(t=new we,e=new lh){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),sr.copy(n.boundingSphere),sr.applyMatrix4(s),sr.radius+=r,t.ray.intersectsSphere(sr)===!1)return;$l.copy(s).invert(),fo.copy(t.ray).applyMatrix4($l);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=d,_=p;g<_;g++){const f=c.getX(g);rr.fromBufferAttribute(u,f),Jl(rr,f,l,s,t,e,this)}}else{const d=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let g=d,_=p;g<_;g++)rr.fromBufferAttribute(u,g),Jl(rr,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Jl(i,t,e,n,s,r,a){const o=fo.distanceSqToPoint(i);if(o<e){const l=new T;fo.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class po extends ke{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class yn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let s=0;const r=n.length;let a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);const h=n[s],d=n[s+1]-h,p=(a-h)/d;return(s+p)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new Q:new T);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new T,s=[],r=[],a=[],o=new T,l=new ne;for(let p=0;p<=t;p++){const g=p/t;s[p]=this.getTangentAt(g,new T)}r[0]=new T,a[0]=new T;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=t;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();const g=Math.acos(Ne(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,g))}a[p].crossVectors(s[p],r[p])}if(e===!0){let p=Math.acos(Ne(r[0].dot(r[t]),-1,1));p/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(p=-p);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],p*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class No extends yn{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new Q){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class R0 extends No{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Fo(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,p*=h,s(a,o,d,p)},calc:function(r){const a=r*r,o=a*r;return i+t*r+e*a+n*o}}}const ar=new T,ga=new Fo,va=new Fo,_a=new Fo;class P0 extends yn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new T){const n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(ar.subVectors(s[0],s[1]).add(s[0]),c=ar);const u=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(ar.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=ar),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),p),_=Math.pow(u.distanceToSquared(d),p),f=Math.pow(d.distanceToSquared(h),p);_<1e-4&&(_=1),g<1e-4&&(g=_),f<1e-4&&(f=_),ga.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,_,f),va.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,_,f),_a.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,_,f)}else this.curveType==="catmullrom"&&(ga.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),va.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),_a.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(ga.calc(l),va.calc(l),_a.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new T().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Zl(i,t,e,n,s){const r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function L0(i,t){const e=1-i;return e*e*t}function D0(i,t){return 2*(1-i)*i*t}function I0(i,t){return i*i*t}function ms(i,t,e,n){return L0(i,t)+D0(i,e)+I0(i,n)}function U0(i,t){const e=1-i;return e*e*e*t}function N0(i,t){const e=1-i;return 3*e*e*i*t}function F0(i,t){return 3*(1-i)*i*i*t}function O0(i,t){return i*i*i*t}function gs(i,t,e,n,s){return U0(i,t)+N0(i,e)+F0(i,n)+O0(i,s)}class ch extends yn{constructor(t=new Q,e=new Q,n=new Q,s=new Q){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new Q){const n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(gs(t,s.x,r.x,a.x,o.x),gs(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class B0 extends yn{constructor(t=new T,e=new T,n=new T,s=new T){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new T){const n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(gs(t,s.x,r.x,a.x,o.x),gs(t,s.y,r.y,a.y,o.y),gs(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class hh extends yn{constructor(t=new Q,e=new Q){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new Q){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new Q){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class k0 extends yn{constructor(t=new T,e=new T){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new T){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new T){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class uh extends yn{constructor(t=new Q,e=new Q,n=new Q){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new Q){const n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(ms(t,s.x,r.x,a.x),ms(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class z0 extends yn{constructor(t=new T,e=new T,n=new T){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new T){const n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(ms(t,s.x,r.x,a.x),ms(t,s.y,r.y,a.y),ms(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class dh extends yn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new Q){const n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return n.set(Zl(o,l.x,c.x,h.x,u.x),Zl(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new Q().fromArray(s))}return this}}var mo=Object.freeze({__proto__:null,ArcCurve:R0,CatmullRomCurve3:P0,CubicBezierCurve:ch,CubicBezierCurve3:B0,EllipseCurve:No,LineCurve:hh,LineCurve3:k0,QuadraticBezierCurve:uh,QuadraticBezierCurve3:z0,SplineCurve:dh});class V0 extends yn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new mo[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(new mo[s.type]().fromJSON(s))}return this}}class go extends V0{constructor(t){super(),this.type="Path",this.currentPoint=new Q,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new hh(this.currentPoint.clone(),new Q(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){const r=new uh(this.currentPoint.clone(),new Q(t,e),new Q(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){const o=new ch(this.currentPoint.clone(),new Q(t,e),new Q(n,s),new Q(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new dh(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){const c=new No(t,e,n,s,r,a,o,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class vs extends we{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);const r=[],a=[],o=[],l=[],c=new T,h=new Q;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){const p=n+u/e*s;c.x=t*Math.cos(p),c.y=t*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/t+1)/2,h.y=(a[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new ie(a,3)),this.setAttribute("normal",new ie(o,3)),this.setAttribute("uv",new ie(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new vs(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class qe extends we{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],d=[],p=[];let g=0;const _=[],f=n/2;let m=0;M(),a===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new ie(u,3)),this.setAttribute("normal",new ie(d,3)),this.setAttribute("uv",new ie(p,2));function M(){const y=new T,L=new T;let R=0;const b=(e-t)/n;for(let P=0;P<=r;P++){const N=[],v=P/r,w=v*(e-t)+t;for(let O=0;O<=s;O++){const B=O/s,k=B*l+o,X=Math.sin(k),z=Math.cos(k);L.x=w*X,L.y=-v*n+f,L.z=w*z,u.push(L.x,L.y,L.z),y.set(X,b,z).normalize(),d.push(y.x,y.y,y.z),p.push(B,1-v),N.push(g++)}_.push(N)}for(let P=0;P<s;P++)for(let N=0;N<r;N++){const v=_[N][P],w=_[N+1][P],O=_[N+1][P+1],B=_[N][P+1];t>0&&(h.push(v,w,B),R+=3),e>0&&(h.push(w,O,B),R+=3)}c.addGroup(m,R,0),m+=R}function x(y){const L=g,R=new Q,b=new T;let P=0;const N=y===!0?t:e,v=y===!0?1:-1;for(let O=1;O<=s;O++)u.push(0,f*v,0),d.push(0,v,0),p.push(.5,.5),g++;const w=g;for(let O=0;O<=s;O++){const k=O/s*l+o,X=Math.cos(k),z=Math.sin(k);b.x=N*z,b.y=f*v,b.z=N*X,u.push(b.x,b.y,b.z),d.push(0,v,0),R.x=X*.5+.5,R.y=z*.5*v+.5,p.push(R.x,R.y),g++}for(let O=0;O<s;O++){const B=L+O,k=w+O;y===!0?h.push(k,k+1,B):h.push(k+1,k,B),P+=3}c.addGroup(m,P,y===!0?1:2),m+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qe(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Dr extends qe{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new Dr(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Oo extends we{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],a=[];o(s),c(n),h(),this.setAttribute("position",new ie(r,3)),this.setAttribute("normal",new ie(r.slice(),3)),this.setAttribute("uv",new ie(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){const x=new T,y=new T,L=new T;for(let R=0;R<e.length;R+=3)p(e[R+0],x),p(e[R+1],y),p(e[R+2],L),l(x,y,L,M)}function l(M,x,y,L){const R=L+1,b=[];for(let P=0;P<=R;P++){b[P]=[];const N=M.clone().lerp(y,P/R),v=x.clone().lerp(y,P/R),w=R-P;for(let O=0;O<=w;O++)O===0&&P===R?b[P][O]=N:b[P][O]=N.clone().lerp(v,O/w)}for(let P=0;P<R;P++)for(let N=0;N<2*(R-P)-1;N++){const v=Math.floor(N/2);N%2===0?(d(b[P][v+1]),d(b[P+1][v]),d(b[P][v])):(d(b[P][v+1]),d(b[P+1][v+1]),d(b[P+1][v]))}}function c(M){const x=new T;for(let y=0;y<r.length;y+=3)x.x=r[y+0],x.y=r[y+1],x.z=r[y+2],x.normalize().multiplyScalar(M),r[y+0]=x.x,r[y+1]=x.y,r[y+2]=x.z}function h(){const M=new T;for(let x=0;x<r.length;x+=3){M.x=r[x+0],M.y=r[x+1],M.z=r[x+2];const y=f(M)/2/Math.PI+.5,L=m(M)/Math.PI+.5;a.push(y,1-L)}g(),u()}function u(){for(let M=0;M<a.length;M+=6){const x=a[M+0],y=a[M+2],L=a[M+4],R=Math.max(x,y,L),b=Math.min(x,y,L);R>.9&&b<.1&&(x<.2&&(a[M+0]+=1),y<.2&&(a[M+2]+=1),L<.2&&(a[M+4]+=1))}}function d(M){r.push(M.x,M.y,M.z)}function p(M,x){const y=M*3;x.x=t[y+0],x.y=t[y+1],x.z=t[y+2]}function g(){const M=new T,x=new T,y=new T,L=new T,R=new Q,b=new Q,P=new Q;for(let N=0,v=0;N<r.length;N+=9,v+=6){M.set(r[N+0],r[N+1],r[N+2]),x.set(r[N+3],r[N+4],r[N+5]),y.set(r[N+6],r[N+7],r[N+8]),R.set(a[v+0],a[v+1]),b.set(a[v+2],a[v+3]),P.set(a[v+4],a[v+5]),L.copy(M).add(x).add(y).divideScalar(3);const w=f(L);_(R,v+0,M,w),_(b,v+2,x,w),_(P,v+4,y,w)}}function _(M,x,y,L){L<0&&M.x===1&&(a[x]=M.x-1),y.x===0&&y.z===0&&(a[x]=L/2/Math.PI+.5)}function f(M){return Math.atan2(M.z,-M.x)}function m(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Oo(t.vertices,t.indices,t.radius,t.details)}}class Es extends go{constructor(t){super(t),this.uuid=In(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(new go().fromJSON(s))}return this}}const G0={triangulate:function(i,t,e=2){const n=t&&t.length,s=n?t[0]*e:i.length;let r=fh(i,0,s,e,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c,h,u,d,p;if(n&&(r=Y0(i,t,r,e)),i.length>80*e){o=c=i[0],l=h=i[1];for(let g=e;g<s;g+=e)u=i[g],d=i[g+1],u<o&&(o=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);p=Math.max(c-o,h-l),p=p!==0?32767/p:0}return bs(r,a,e,o,l,p,0),a}};function fh(i,t,e,n,s){let r,a;if(s===sg(i,t,e,n)>0)for(r=t;r<e;r+=n)a=Ql(r,i[r],i[r+1],a);else for(r=e-n;r>=t;r-=n)a=Ql(r,i[r],i[r+1],a);return a&&Ir(a,a.next)&&(As(a),a=a.next),a}function ui(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Ir(e,e.next)||pe(e.prev,e,e.next)===0)){if(As(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function bs(i,t,e,n,s,r,a){if(!i)return;!a&&r&&Z0(i,n,s,r);let o=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?W0(i,n,s,r):H0(i)){t.push(l.i/e|0),t.push(i.i/e|0),t.push(c.i/e|0),As(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=X0(ui(i),t,e),bs(i,t,e,n,s,r,2)):a===2&&q0(i,t,e,n,s,r):bs(ui(i),t,e,n,s,r,1);break}}}function H0(i){const t=i.prev,e=i,n=i.next;if(pe(t,e,n)>=0)return!1;const s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=s<r?s<a?s:a:r<a?r:a,u=o<l?o<c?o:c:l<c?l:c,d=s>r?s>a?s:a:r>a?r:a,p=o>l?o>c?o:c:l>c?l:c;let g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=p&&Oi(s,o,r,l,a,c,g.x,g.y)&&pe(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function W0(i,t,e,n){const s=i.prev,r=i,a=i.next;if(pe(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,h=s.y,u=r.y,d=a.y,p=o<l?o<c?o:c:l<c?l:c,g=h<u?h<d?h:d:u<d?u:d,_=o>l?o>c?o:c:l>c?l:c,f=h>u?h>d?h:d:u>d?u:d,m=vo(p,g,t,e,n),M=vo(_,f,t,e,n);let x=i.prevZ,y=i.nextZ;for(;x&&x.z>=m&&y&&y.z<=M;){if(x.x>=p&&x.x<=_&&x.y>=g&&x.y<=f&&x!==s&&x!==a&&Oi(o,h,l,u,c,d,x.x,x.y)&&pe(x.prev,x,x.next)>=0||(x=x.prevZ,y.x>=p&&y.x<=_&&y.y>=g&&y.y<=f&&y!==s&&y!==a&&Oi(o,h,l,u,c,d,y.x,y.y)&&pe(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;x&&x.z>=m;){if(x.x>=p&&x.x<=_&&x.y>=g&&x.y<=f&&x!==s&&x!==a&&Oi(o,h,l,u,c,d,x.x,x.y)&&pe(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;y&&y.z<=M;){if(y.x>=p&&y.x<=_&&y.y>=g&&y.y<=f&&y!==s&&y!==a&&Oi(o,h,l,u,c,d,y.x,y.y)&&pe(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function X0(i,t,e){let n=i;do{const s=n.prev,r=n.next.next;!Ir(s,r)&&ph(s,n,n.next,r)&&Ts(s,r)&&Ts(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),As(n),As(n.next),n=i=r),n=n.next}while(n!==i);return ui(n)}function q0(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&eg(a,o)){let l=mh(a,o);a=ui(a,a.next),l=ui(l,l.next),bs(a,t,e,n,s,r,0),bs(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Y0(i,t,e,n){const s=[];let r,a,o,l,c;for(r=0,a=t.length;r<a;r++)o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=fh(i,o,l,n,!1),c===c.next&&(c.steiner=!0),s.push(tg(c));for(s.sort(K0),r=0;r<s.length;r++)e=$0(s[r],e);return e}function K0(i,t){return i.x-t.x}function $0(i,t){const e=j0(i,t);if(!e)return t;const n=mh(e,i);return ui(n,n.next),ui(e,e.next)}function j0(i,t){let e=t,n=-1/0,s;const r=i.x,a=i.y;do{if(a<=e.y&&a>=e.next.y&&e.next.y!==e.y){const d=e.x+(a-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=r&&d>n&&(n=d,s=e.x<e.next.x?e:e.next,d===r))return s}e=e.next}while(e!==t);if(!s)return null;const o=s,l=s.x,c=s.y;let h=1/0,u;e=s;do r>=e.x&&e.x>=l&&r!==e.x&&Oi(a<c?r:n,a,l,c,a<c?n:r,a,e.x,e.y)&&(u=Math.abs(a-e.y)/(r-e.x),Ts(e,i)&&(u<h||u===h&&(e.x>s.x||e.x===s.x&&J0(s,e)))&&(s=e,h=u)),e=e.next;while(e!==o);return s}function J0(i,t){return pe(i.prev,i,t.prev)<0&&pe(t.next,i,i.next)<0}function Z0(i,t,e,n){let s=i;do s.z===0&&(s.z=vo(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Q0(s)}function Q0(i){let t,e,n,s,r,a,o,l,c=1;do{for(e=i,i=null,r=null,a=0;e;){for(a++,n=e,o=0,t=0;t<c&&(o++,n=n.nextZ,!!n);t++);for(l=c;o>0||l>0&&n;)o!==0&&(l===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,o--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,c*=2}while(a>1);return i}function vo(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function tg(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Oi(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function eg(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!ng(i,t)&&(Ts(i,t)&&Ts(t,i)&&ig(i,t)&&(pe(i.prev,i,t.prev)||pe(i,t.prev,t))||Ir(i,t)&&pe(i.prev,i,i.next)>0&&pe(t.prev,t,t.next)>0)}function pe(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Ir(i,t){return i.x===t.x&&i.y===t.y}function ph(i,t,e,n){const s=lr(pe(i,t,e)),r=lr(pe(i,t,n)),a=lr(pe(e,n,i)),o=lr(pe(e,n,t));return!!(s!==r&&a!==o||s===0&&or(i,e,t)||r===0&&or(i,n,t)||a===0&&or(e,i,n)||o===0&&or(e,t,n))}function or(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function lr(i){return i>0?1:i<0?-1:0}function ng(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&ph(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Ts(i,t){return pe(i.prev,i,i.next)<0?pe(i,t,i.next)>=0&&pe(i,i.prev,t)>=0:pe(i,t,i.prev)<0||pe(i,i.next,t)<0}function ig(i,t){let e=i,n=!1;const s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function mh(i,t){const e=new _o(i.i,i.x,i.y),n=new _o(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Ql(i,t,e,n){const s=new _o(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function As(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function _o(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function sg(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class _s{static area(t){const e=t.length;let n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return _s.area(t)<0}static triangulateShape(t,e){const n=[],s=[],r=[];tc(t),ec(n,t);let a=t.length;e.forEach(tc);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,ec(n,e[l]);const o=G0.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function tc(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function ec(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class $i extends we{constructor(t=new Es([new Q(.5,.5),new Q(-.5,.5),new Q(-.5,-.5),new Q(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){const c=t[o];a(c)}this.setAttribute("position",new ie(s,3)),this.setAttribute("uv",new ie(r,2)),this.computeVertexNormals();function a(o){const l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1;let d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,p=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:p-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,f=e.bevelSegments!==void 0?e.bevelSegments:3;const m=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:rg;let x,y=!1,L,R,b,P;m&&(x=m.getSpacedPoints(h),y=!0,d=!1,L=m.computeFrenetFrames(h,!1),R=new T,b=new T,P=new T),d||(f=0,p=0,g=0,_=0);const N=o.extractPoints(c);let v=N.shape;const w=N.holes;if(!_s.isClockWise(v)){v=v.reverse();for(let $=0,C=w.length;$<C;$++){const ot=w[$];_s.isClockWise(ot)&&(w[$]=ot.reverse())}}const B=_s.triangulateShape(v,w),k=v;for(let $=0,C=w.length;$<C;$++){const ot=w[$];v=v.concat(ot)}function X($,C,ot){return C||console.error("THREE.ExtrudeGeometry: vec does not exist"),$.clone().addScaledVector(C,ot)}const z=v.length,j=B.length;function H($,C,ot){let rt,tt,lt;const Pt=$.x-C.x,xt=$.y-C.y,A=ot.x-$.x,S=ot.y-$.y,F=Pt*Pt+xt*xt,Y=Pt*S-xt*A;if(Math.abs(Y)>Number.EPSILON){const J=Math.sqrt(F),K=Math.sqrt(A*A+S*S),At=C.x-xt/J,ut=C.y+Pt/J,wt=ot.x-S/K,qt=ot.y+A/K,nt=((wt-At)*S-(qt-ut)*A)/(Pt*S-xt*A);rt=At+Pt*nt-$.x,tt=ut+xt*nt-$.y;const Et=rt*rt+tt*tt;if(Et<=2)return new Q(rt,tt);lt=Math.sqrt(Et/2)}else{let J=!1;Pt>Number.EPSILON?A>Number.EPSILON&&(J=!0):Pt<-Number.EPSILON?A<-Number.EPSILON&&(J=!0):Math.sign(xt)===Math.sign(S)&&(J=!0),J?(rt=-xt,tt=Pt,lt=Math.sqrt(F)):(rt=Pt,tt=xt,lt=Math.sqrt(F/2))}return new Q(rt/lt,tt/lt)}const at=[];for(let $=0,C=k.length,ot=C-1,rt=$+1;$<C;$++,ot++,rt++)ot===C&&(ot=0),rt===C&&(rt=0),at[$]=H(k[$],k[ot],k[rt]);const ft=[];let pt,Vt=at.concat();for(let $=0,C=w.length;$<C;$++){const ot=w[$];pt=[];for(let rt=0,tt=ot.length,lt=tt-1,Pt=rt+1;rt<tt;rt++,lt++,Pt++)lt===tt&&(lt=0),Pt===tt&&(Pt=0),pt[rt]=H(ot[rt],ot[lt],ot[Pt]);ft.push(pt),Vt=Vt.concat(pt)}for(let $=0;$<f;$++){const C=$/f,ot=p*Math.cos(C*Math.PI/2),rt=g*Math.sin(C*Math.PI/2)+_;for(let tt=0,lt=k.length;tt<lt;tt++){const Pt=X(k[tt],at[tt],rt);ht(Pt.x,Pt.y,-ot)}for(let tt=0,lt=w.length;tt<lt;tt++){const Pt=w[tt];pt=ft[tt];for(let xt=0,A=Pt.length;xt<A;xt++){const S=X(Pt[xt],pt[xt],rt);ht(S.x,S.y,-ot)}}}const Wt=g+_;for(let $=0;$<z;$++){const C=d?X(v[$],Vt[$],Wt):v[$];y?(b.copy(L.normals[0]).multiplyScalar(C.x),R.copy(L.binormals[0]).multiplyScalar(C.y),P.copy(x[0]).add(b).add(R),ht(P.x,P.y,P.z)):ht(C.x,C.y,0)}for(let $=1;$<=h;$++)for(let C=0;C<z;C++){const ot=d?X(v[C],Vt[C],Wt):v[C];y?(b.copy(L.normals[$]).multiplyScalar(ot.x),R.copy(L.binormals[$]).multiplyScalar(ot.y),P.copy(x[$]).add(b).add(R),ht(P.x,P.y,P.z)):ht(ot.x,ot.y,u/h*$)}for(let $=f-1;$>=0;$--){const C=$/f,ot=p*Math.cos(C*Math.PI/2),rt=g*Math.sin(C*Math.PI/2)+_;for(let tt=0,lt=k.length;tt<lt;tt++){const Pt=X(k[tt],at[tt],rt);ht(Pt.x,Pt.y,u+ot)}for(let tt=0,lt=w.length;tt<lt;tt++){const Pt=w[tt];pt=ft[tt];for(let xt=0,A=Pt.length;xt<A;xt++){const S=X(Pt[xt],pt[xt],rt);y?ht(S.x,S.y+x[h-1].y,x[h-1].x+ot):ht(S.x,S.y,u+ot)}}}q(),et();function q(){const $=s.length/3;if(d){let C=0,ot=z*C;for(let rt=0;rt<j;rt++){const tt=B[rt];It(tt[2]+ot,tt[1]+ot,tt[0]+ot)}C=h+f*2,ot=z*C;for(let rt=0;rt<j;rt++){const tt=B[rt];It(tt[0]+ot,tt[1]+ot,tt[2]+ot)}}else{for(let C=0;C<j;C++){const ot=B[C];It(ot[2],ot[1],ot[0])}for(let C=0;C<j;C++){const ot=B[C];It(ot[0]+z*h,ot[1]+z*h,ot[2]+z*h)}}n.addGroup($,s.length/3-$,0)}function et(){const $=s.length/3;let C=0;St(k,C),C+=k.length;for(let ot=0,rt=w.length;ot<rt;ot++){const tt=w[ot];St(tt,C),C+=tt.length}n.addGroup($,s.length/3-$,1)}function St($,C){let ot=$.length;for(;--ot>=0;){const rt=ot;let tt=ot-1;tt<0&&(tt=$.length-1);for(let lt=0,Pt=h+f*2;lt<Pt;lt++){const xt=z*lt,A=z*(lt+1),S=C+rt+xt,F=C+tt+xt,Y=C+tt+A,J=C+rt+A;Dt(S,F,Y,J)}}}function ht($,C,ot){l.push($),l.push(C),l.push(ot)}function It($,C,ot){ct($),ct(C),ct(ot);const rt=s.length/3,tt=M.generateTopUV(n,s,rt-3,rt-2,rt-1);mt(tt[0]),mt(tt[1]),mt(tt[2])}function Dt($,C,ot,rt){ct($),ct(C),ct(rt),ct(C),ct(ot),ct(rt);const tt=s.length/3,lt=M.generateSideWallUV(n,s,tt-6,tt-3,tt-2,tt-1);mt(lt[0]),mt(lt[1]),mt(lt[3]),mt(lt[1]),mt(lt[2]),mt(lt[3])}function ct($){s.push(l[$*3+0]),s.push(l[$*3+1]),s.push(l[$*3+2])}function mt($){r.push($.x),r.push($.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return ag(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,a=t.shapes.length;r<a;r++){const o=e[t.shapes[r]];n.push(o)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new mo[s.type]().fromJSON(s)),new $i(n,t.options)}}const rg={generateTopUV:function(i,t,e,n,s){const r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new Q(r,a),new Q(o,l),new Q(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){const a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[s*3],p=t[s*3+1],g=t[s*3+2],_=t[r*3],f=t[r*3+1],m=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new Q(a,1-l),new Q(c,1-u),new Q(d,1-g),new Q(_,1-m)]:[new Q(o,1-l),new Q(h,1-u),new Q(p,1-g),new Q(f,1-m)]}};function ag(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class Tr extends Oo{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Tr(t.radius,t.detail)}}class Bo extends we{constructor(t=.5,e=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const o=[],l=[],c=[],h=[];let u=t;const d=(e-t)/s,p=new T,g=new Q;for(let _=0;_<=s;_++){for(let f=0;f<=n;f++){const m=r+f/n*a;p.x=u*Math.cos(m),p.y=u*Math.sin(m),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/e+1)/2,g.y=(p.y/e+1)/2,h.push(g.x,g.y)}u+=d}for(let _=0;_<s;_++){const f=_*(n+1);for(let m=0;m<n;m++){const M=m+f,x=M,y=M+n+1,L=M+n+2,R=M+1;o.push(x,y,R),o.push(y,L,R)}}this.setIndex(o),this.setAttribute("position",new ie(l,3)),this.setAttribute("normal",new ie(c,3)),this.setAttribute("uv",new ie(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Bo(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Le extends we{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new T,d=new T,p=[],g=[],_=[],f=[];for(let m=0;m<=n;m++){const M=[],x=m/n;let y=0;m===0&&a===0?y=.5/e:m===n&&l===Math.PI&&(y=-.5/e);for(let L=0;L<=e;L++){const R=L/e;u.x=-t*Math.cos(s+R*r)*Math.sin(a+x*o),u.y=t*Math.cos(a+x*o),u.z=t*Math.sin(s+R*r)*Math.sin(a+x*o),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),f.push(R+y,1-x),M.push(c++)}h.push(M)}for(let m=0;m<n;m++)for(let M=0;M<e;M++){const x=h[m][M+1],y=h[m][M],L=h[m+1][M],R=h[m+1][M+1];(m!==0||a>0)&&p.push(x,y,R),(m!==n-1||l<Math.PI)&&p.push(y,L,R)}this.setIndex(p),this.setAttribute("position",new ie(g,3)),this.setAttribute("normal",new ie(_,3)),this.setAttribute("uv",new ie(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Le(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Kn extends we{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const a=[],o=[],l=[],c=[],h=new T,u=new T,d=new T;for(let p=0;p<=n;p++)for(let g=0;g<=s;g++){const _=g/s*r,f=p/n*Math.PI*2;u.x=(t+e*Math.cos(f))*Math.cos(_),u.y=(t+e*Math.cos(f))*Math.sin(_),u.z=e*Math.sin(f),o.push(u.x,u.y,u.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/s),c.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=s;g++){const _=(s+1)*p+g-1,f=(s+1)*(p-1)+g-1,m=(s+1)*(p-1)+g,M=(s+1)*p+g;a.push(_,f,M),a.push(f,m,M)}this.setIndex(a),this.setAttribute("position",new ie(o,3)),this.setAttribute("normal",new ie(l,3)),this.setAttribute("uv",new ie(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Kn(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class og extends he{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class fe extends di{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ut(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ut(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Vc,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new an,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class ko extends Ce{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ut(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class lg extends ko{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ce.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ut(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const xa=new ne,nc=new T,ic=new T;class cg{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q(512,512),this.map=null,this.mapPass=null,this.matrix=new ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Do,this._frameExtents=new Q(1,1),this._viewportCount=1,this._viewports=[new re(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;nc.setFromMatrixPosition(t.matrixWorld),e.position.copy(nc),ic.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ic),e.updateMatrixWorld(),xa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xa)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const sc=new ne,us=new T,ya=new T;class hg extends cg{constructor(){super(new Qe(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Q(4,2),this._viewportCount=6,this._viewports=[new re(2,1,1,1),new re(0,1,1,1),new re(3,1,1,1),new re(1,1,1,1),new re(3,0,1,1),new re(1,0,1,1)],this._cubeDirections=[new T(1,0,0),new T(-1,0,0),new T(0,0,1),new T(0,0,-1),new T(0,1,0),new T(0,-1,0)],this._cubeUps=[new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,0,1),new T(0,0,-1)]}updateMatrices(t,e=0){const n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),us.setFromMatrixPosition(t.matrixWorld),n.position.copy(us),ya.copy(n.position),ya.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(ya),n.updateMatrixWorld(),s.makeTranslation(-us.x,-us.y,-us.z),sc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(sc)}}class _r extends ko{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new hg}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class ug extends ko{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class dg{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=rc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=rc();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function rc(){return performance.now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:So}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=So);const gh={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class ts{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const fg=new Io(-1,1,1,-1,0,1);class pg extends we{constructor(){super(),this.setAttribute("position",new ie([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ie([0,2,0,0,2,0],2))}}const mg=new pg;class zo{constructor(t){this._mesh=new it(mg,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,fg)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class gg extends ts{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof he?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=ws.clone(t.uniforms),this.material=new he({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new zo(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class ac extends ts{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){const s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class vg extends ts{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class _g{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const n=t.getSize(new Q);this._width=n.width,this._height=n.height,e=new pn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Dn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new gg(gh),this.copyPass.material.blending=Ln,this.clock=new dg}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}ac!==void 0&&(a instanceof ac?n=!0:a instanceof vg&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new Q);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class xg extends ts{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ut}render(t,e,n){const s=t.autoClear;t.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=s}}const yg={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ut(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class ji extends ts{constructor(t,e,n,s){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=s,this.resolution=t!==void 0?new Q(t.x,t.y):new Q(256,256),this.clearColor=new Ut(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new pn(r,a,{type:Dn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const d=new pn(r,a,{type:Dn});d.texture.name="UnrealBloomPass.h"+u,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const p=new pn(r,a,{type:Dn});p.texture.name="UnrealBloomPass.v"+u,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),r=Math.round(r/2),a=Math.round(a/2)}const o=yg;this.highPassUniforms=ws.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new he({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new Q(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=gh;this.copyUniforms=ws.clone(h.uniforms),this.blendMaterial=new he({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:Oe,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Ut,this.oldClearAlpha=1,this.basic=new Se,this.fsQuad=new zo(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new Q(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(t,e,n,s,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=ji.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=ji.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=a}getSeperableBlurMaterial(t){const e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new he({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new Q(.5,.5)},direction:{value:new Q(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new he({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}ji.BlurDirectionX=new Q(1,0);ji.BlurDirectionY=new Q(0,1);const Mg={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Sg extends ts{constructor(){super();const t=Mg;this.uniforms=ws.clone(t.uniforms),this.material=new og({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new zo(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},Jt.getTransfer(this._outputColorSpace)===le&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Tc?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Ac?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Cc?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===wo?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Rc?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Pc&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const oc="deep-space-drifter.settings.v1",xs={low:{label:"低",pixelRatio:1,bloom:!1,shadows:!1,stars:4500,asteroids:420,nebulaTexture:384,planetTexture:512,atmosphereSegments:48,ringSegments:96,anisotropy:1,dust:!1,nebulaShell:!1,mfdHz:8},medium:{label:"中",pixelRatio:1.25,bloom:!0,shadows:!1,stars:9e3,asteroids:900,nebulaTexture:640,planetTexture:768,atmosphereSegments:72,ringSegments:192,anisotropy:4,dust:!0,nebulaShell:!1,mfdHz:15},high:{label:"高",pixelRatio:2,bloom:!0,shadows:!0,stars:15e3,asteroids:1500,nebulaTexture:1024,planetTexture:1024,atmosphereSegments:96,ringSegments:320,anisotropy:8,dust:!0,nebulaShell:!0,mfdHz:24}},ds={quality:"medium",masterVolume:.7,muted:!1,sensitivity:1,invertY:!1,fov:72,flightAssist:!0,showHud:!0,cameraMode:"cockpit"};class wg{constructor(){this.data={...ds},this.load()}load(){try{const t=localStorage.getItem(oc);if(t){const e=JSON.parse(t);for(const n of Object.keys(ds))e[n]!==void 0&&typeof e[n]==typeof ds[n]&&(this.data[n]=e[n])}}catch(t){console.warn("[Settings] failed to load, using defaults",t)}return xs[this.data.quality]||(this.data.quality=ds.quality),this.data}save(){try{localStorage.setItem(oc,JSON.stringify(this.data))}catch(t){console.warn("[Settings] failed to persist",t)}}get(t){return this.data[t]}set(t,e){return this.data[t]===e?!1:(this.data[t]=e,this.save(),!0)}reset(){this.data={...ds},this.save()}get quality(){return xs[this.data.quality]||xs.medium}}const lc="deep-space-drifter.save.v1",cc=1;class Eg{constructor(){this.data=this._blank(),this.load()}_blank(){return{version:cc,createdAt:Date.now(),discoveries:{},missions:{},credits:0,docked:!1,dockedCount:0,totalDistance:0,jumps:0,scans:0,lastPosition:null,tutorialSeen:!1,playtime:0}}load(){try{const t=localStorage.getItem(lc);if(t){const e=JSON.parse(t);e&&e.version===cc&&(this.data={...this._blank(),...e})}}catch(t){console.warn("[SaveGame] load failed, starting fresh",t)}return this.data}save(){try{localStorage.setItem(lc,JSON.stringify(this.data))}catch(t){console.warn("[SaveGame] save failed",t)}}hasDiscovered(t){return!!this.data.discoveries[t]}discover(t,e,n="body"){return this.hasDiscovered(t)?!1:(this.data.discoveries[t]={name:e,kind:n,at:Date.now()},this.data.scans+=1,this.data.credits+=120,this.save(),!0)}completeMission(t){return this.data.missions[t]?!1:(this.data.missions[t]=!0,this.data.credits+=250,this.save(),!0)}isMissionComplete(t){return!!this.data.missions[t]}get discoveryCount(){return Object.keys(this.data.discoveries).length}addCredits(t){this.data.credits=Math.max(0,this.data.credits+t),this.save()}reset(){this.data=this._blank(),this.save()}}class bg{constructor(){this._map=new Map}on(t,e){return this._map.has(t)||this._map.set(t,new Set),this._map.get(t).add(e),()=>this.off(t,e)}once(t,e){const n=this.on(t,s=>{n(),e(s)});return n}off(t,e){const n=this._map.get(t);n&&n.delete(e)}emit(t,e){const n=this._map.get(t);if(n)for(const s of Array.from(n))try{s(e)}catch(r){console.error(`[EventBus] handler for "${t}" failed`,r)}}}class Tg{constructor(t){this.dom=t,this.keys=new Set,this.pressed=new Set,this.mouseDX=0,this.mouseDY=0,this.dragging=!1,this.pointerLocked=!1,this.lockFailed=!1,this.lockErrorMessage="",this.enabled=!0,this.sensitivity=1,this.invertY=!1,this.onKeyAction=()=>{},this.onPointerLockLost=()=>{},this._suppressLockLost=!1,this._lastTabAt=-1/0,this._lastEscapeAt=-1/0,this.captureTab=()=>!1,this._lastMouse={x:0,y:0},this._onKeyDown=this._handleKeyDown.bind(this),this._onKeyUp=this._handleKeyUp.bind(this),this._onMouseMove=this._handleMouseMove.bind(this),this._onMouseDown=this._handleMouseDown.bind(this),this._onMouseUp=this._handleMouseUp.bind(this),this._onLockChange=this._handleLockChange.bind(this),this._onLockError=this._handleLockError.bind(this),this._onBlur=this._handleBlur.bind(this),this._onContextMenu=e=>e.preventDefault(),window.addEventListener("keydown",this._onKeyDown),window.addEventListener("keyup",this._onKeyUp),window.addEventListener("mousemove",this._onMouseMove),window.addEventListener("mousedown",this._onMouseDown),window.addEventListener("mouseup",this._onMouseUp),window.addEventListener("blur",this._onBlur),document.addEventListener("pointerlockchange",this._onLockChange),document.addEventListener("pointerlockerror",this._onLockError),this.dom.addEventListener("contextmenu",this._onContextMenu)}isDown(t){return this.keys.has(t)}wasPressed(t){return this.pressed.has(t)}anyDown(...t){return t.some(e=>this.keys.has(e))}requestLock(){if(this.pointerLocked)return;const t=this.dom;try{const e=t.requestPointerLock({unadjustedMovement:!1});e&&typeof e.then=="function"&&e.catch(n=>{try{const s=t.requestPointerLock();s&&typeof s.then=="function"&&s.catch(r=>this._handleLockError(r))}catch{this._handleLockError(n)}})}catch(e){this._handleLockError(e)}}releaseLock(){this._suppressLockLost=!0,document.pointerLockElement===this.dom&&document.exitPointerLock(),setTimeout(()=>{this._suppressLockLost=!1},0)}consumeMouseDelta(){const t=this.mouseDX,e=this.mouseDY;return this.mouseDX=0,this.mouseDY=0,{dx:t,dy:e}}endFrame(){this.pressed.clear()}dispose(){window.removeEventListener("keydown",this._onKeyDown),window.removeEventListener("keyup",this._onKeyUp),window.removeEventListener("mousemove",this._onMouseMove),window.removeEventListener("mousedown",this._onMouseDown),window.removeEventListener("mouseup",this._onMouseUp),window.removeEventListener("blur",this._onBlur),document.removeEventListener("pointerlockchange",this._onLockChange),document.removeEventListener("pointerlockerror",this._onLockError),this.dom.removeEventListener("contextmenu",this._onContextMenu)}_handleKeyDown(t){if(t.code==="Escape"&&(this._lastEscapeAt=performance.now()),this._isInteractiveTarget(document.activeElement)){t.code==="Escape"&&this.onKeyAction(t.code,t);return}if(t.code==="Tab"&&(this._lastTabAt=performance.now(),this.captureTab())){t.preventDefault(),this._focusSurface();return}if(t.repeat){this._shouldPreventDefault(t.code)&&t.preventDefault();return}this._shouldPreventDefault(t.code)&&t.preventDefault(),this.keys.add(t.code),this.pressed.add(t.code),this.onKeyAction(t.code,t)}_handleKeyUp(t){this.keys.delete(t.code)}_isInteractiveTarget(t){if(!t||t===document.body||t===document.documentElement)return!1;const e=(t.tagName||"").toUpperCase();return e==="INPUT"||e==="SELECT"||e==="TEXTAREA"||e==="BUTTON"||e==="A"||e==="OPTION"||t.isContentEditable===!0}tabPressedRecently(t=400){return performance.now()-this._lastTabAt<t}lastEscapeAt(){return this._lastEscapeAt}_focusSurface(){const t=this._surfaceElement();if(t){t.hasAttribute("tabindex")||t.setAttribute("tabindex","0");try{t.focus({preventScroll:!0})}catch{t.focus()}}}_surfaceElement(){const t=this.dom;return t?t.tagName==="CANVAS"?t:t.querySelector?t.querySelector("canvas"):null:null}_shouldPreventDefault(t){return["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD","KeyQ","KeyE","KeyF","KeyR","KeyM","KeyH","KeyV","KeyX","KeyB","ControlLeft","ControlRight"].includes(t)}_handleMouseMove(t){if(this.enabled){if(this.pointerLocked){this.mouseDX+=(t.movementX||0)*this.sensitivity,this.mouseDY+=(t.movementY||0)*this.sensitivity;return}if(this.dragging){const e=t.clientX-this._lastMouse.x,n=t.clientY-this._lastMouse.y;this.mouseDX+=e*this.sensitivity*1.35,this.mouseDY+=n*this.sensitivity*1.35}this._lastMouse.x=t.clientX,this._lastMouse.y=t.clientY}}_handleMouseDown(t){t.button===0&&(this.dragging=!0,this._lastMouse.x=t.clientX,this._lastMouse.y=t.clientY)}_handleMouseUp(t){t.button===0&&(this.dragging=!1)}_handleLockChange(){const t=document.pointerLockElement===this.dom,e=this.pointerLocked;if(this.pointerLocked=t,t){this.lockFailed=!1,this.lockErrorMessage="";return}e&&!this._suppressLockLost&&this.onPointerLockLost()}_handleLockError(t){this.lockFailed=!0,this.pointerLocked=!1,this.lockErrorMessage=t&&t.message?t.message:"Pointer lock unavailable",console.warn("[Input] pointer lock failed — falling back to drag/arrow steering",t)}_handleBlur(){this.keys.clear(),this.dragging=!1}}class Ag{constructor(){this.ctx=null,this.ready=!1,this.muted=!1,this.masterVolume=.7,this._nodes={},this._noiseBuffer=null,this._lastBeep=0}async init(){if(this.ready)return this.ctx.state==="suspended"&&await this.ctx.resume(),!0;const t=window.AudioContext||window.webkitAudioContext;if(!t)return console.warn("[Audio] WebAudio unavailable"),!1;try{this.ctx=new t,this.ctx.state==="suspended"&&await this.ctx.resume()}catch(e){return console.warn("[Audio] failed to create context",e),!1}return this._build(),this.ready=!0,this._applyVolume(),!0}_build(){const t=this.ctx,e=t.createGain();e.gain.value=this.masterVolume;const n=t.createDynamicsCompressor();n.threshold.value=-18,n.knee.value=22,n.ratio.value=8,n.attack.value=.004,n.release.value=.22,e.connect(n),n.connect(t.destination),this._nodes.master=e;const s=t.createGain();s.gain.value=0;const r=t.createBiquadFilter();r.type="lowpass",r.frequency.value=320,r.Q.value=3.2,s.connect(r),r.connect(e);const a=t.createOscillator();a.type="sawtooth",a.frequency.value=46;const o=t.createGain();o.gain.value=.55,a.connect(o).connect(s),a.start();const l=t.createOscillator();l.type="square",l.frequency.value=69;const c=t.createGain();c.gain.value=.2,l.connect(c).connect(s),l.start();const h=t.createOscillator();h.type="sine",h.frequency.value=23;const u=t.createGain();u.gain.value=.7,h.connect(u).connect(s),h.start();const d=t.createOscillator();d.type="sine",d.frequency.value=5.4;const p=t.createGain();p.gain.value=4.5,d.connect(p).connect(a.frequency),d.start(),this._nodes.engineGain=s,this._nodes.engineFilter=r,this._nodes.oscA=a,this._nodes.oscB=l,this._noiseBuffer=this._makeNoise(2);const g=t.createBufferSource();g.buffer=this._noiseBuffer,g.loop=!0;const _=t.createBiquadFilter();_.type="bandpass",_.frequency.value=900,_.Q.value=.9;const f=t.createGain();f.gain.value=0,g.connect(_).connect(f).connect(e),g.start(),this._nodes.thrGain=f,this._nodes.thrFilter=_;const m=t.createBufferSource();m.buffer=this._noiseBuffer,m.loop=!0;const M=t.createBiquadFilter();M.type="lowpass",M.frequency.value=480;const x=t.createGain();x.gain.value=0,m.connect(M).connect(x).connect(e),m.start(),this._nodes.windGain=x,this._nodes.windFilter=M;const y=t.createBufferSource();y.buffer=this._noiseBuffer,y.loop=!0;const L=t.createBiquadFilter();L.type="bandpass",L.frequency.value=260,L.Q.value=.55;const R=t.createGain();R.gain.value=0,y.connect(L).connect(R).connect(e),y.start(),this._nodes.atmGain=R;const b=t.createBufferSource();b.buffer=this._noiseBuffer,b.loop=!0;const P=t.createBiquadFilter();P.type="lowpass",P.frequency.value=190;const N=t.createGain();N.gain.value=.05,b.connect(P).connect(N).connect(e),b.start()}_makeNoise(t){const e=this.ctx,n=Math.floor(e.sampleRate*t),s=e.createBuffer(1,n,e.sampleRate),r=s.getChannelData(0);let a=0;for(let o=0;o<n;o++){const l=Math.random()*2-1;a=(a+.02*l)/1.02,r[o]=a*3.2}return s}setEngineLoad(t,e){if(!this.ready)return;const n=Math.max(0,Math.min(1,t)),s=Math.max(0,Math.min(1,e/12)),r=this.ctx.currentTime;this._nodes.engineGain.gain.setTargetAtTime(.035+n*.085+s*.03,r,.18),this._nodes.engineFilter.frequency.setTargetAtTime(280+n*620+s*240,r,.22),this._nodes.oscA.frequency.setTargetAtTime(46+n*26+s*12,r,.3),this._nodes.oscB.frequency.setTargetAtTime(69+n*40,r,.3)}setThruster(t){if(!this.ready)return;const e=this.ctx.currentTime;this._nodes.thrGain.gain.setTargetAtTime(Math.max(0,Math.min(1,t))*.16,e,.12),this._nodes.thrFilter.frequency.setTargetAtTime(700+t*1400,e,.2)}setWind(t){if(!this.ready)return;const e=this.ctx.currentTime;this._nodes.windGain.gain.setTargetAtTime(Math.max(0,Math.min(1,t))*.055,e,.3),this._nodes.windFilter.frequency.setTargetAtTime(320+t*1400,e,.3)}setAtmosphere(t){if(!this.ready)return;const e=this.ctx.currentTime;this._nodes.atmGain.gain.setTargetAtTime(Math.max(0,Math.min(1,t))*.13,e,.25)}_env(t,e,n,s,r=0){const a=this.ctx.currentTime+r;t.gain.cancelScheduledValues(a),t.gain.setValueAtTime(1e-4,a),t.gain.exponentialRampToValueAtTime(Math.max(2e-4,e),a+n),t.gain.exponentialRampToValueAtTime(1e-4,a+n+s)}tone(t,{type:e="sine",peak:n=.15,attack:s=.008,decay:r=.18,when:a=0,slideTo:o=null}={}){if(!this.ready)return;const l=this.ctx,c=l.createOscillator(),h=l.createGain();c.type=e;const u=l.currentTime+a;c.frequency.setValueAtTime(t,u),o&&c.frequency.exponentialRampToValueAtTime(Math.max(1,o),u+s+r),c.connect(h).connect(this._nodes.master),this._env(h,n,s,r,a),c.start(u),c.stop(u+s+r+.05)}noiseBurst({peak:t=.2,attack:e=.005,decay:n=.3,freq:s=400,type:r="lowpass",q:a=1,sweepTo:o=null}={}){if(!this.ready)return;const l=this.ctx,c=l.createBufferSource();c.buffer=this._noiseBuffer;const h=l.createBiquadFilter();h.type=r,h.Q.value=a;const u=l.createGain(),d=l.currentTime;h.frequency.setValueAtTime(s,d),o&&h.frequency.exponentialRampToValueAtTime(Math.max(40,o),d+e+n),c.connect(h).connect(u).connect(this._nodes.master),this._env(u,t,e,n),c.start(d),c.stop(d+e+n+.05)}uiClick(){this.tone(880,{type:"square",peak:.05,attack:.002,decay:.05})}uiHover(){this.tone(1320,{type:"sine",peak:.025,attack:.002,decay:.04})}scanPing(t=0){this.tone(520+t*90,{type:"square",peak:.07,attack:.004,decay:.11})}scanComplete(){this.tone(660,{type:"sine",peak:.12,attack:.01,decay:.35}),this.tone(990,{type:"sine",peak:.1,attack:.01,decay:.45,when:.12}),this.tone(1320,{type:"sine",peak:.08,attack:.01,decay:.6,when:.24})}warpCharge(t=1.2){this.ready&&(this.tone(90,{type:"sawtooth",peak:.12,attack:.4,decay:t,slideTo:900}),this.noiseBurst({peak:.1,attack:.5,decay:t,freq:200,type:"bandpass",q:2,sweepTo:5e3}))}warpJump(){this.noiseBurst({peak:.26,attack:.03,decay:.9,freq:6e3,type:"lowpass",sweepTo:120}),this.tone(1200,{type:"triangle",peak:.16,attack:.02,decay:1.1,slideTo:120})}dockSuccess(){[523.25,659.25,783.99,1046.5].forEach((e,n)=>{this.tone(e,{type:"sine",peak:.14,attack:.01,decay:.6,when:n*.13})})}alert(){this.tone(740,{type:"square",peak:.09,attack:.005,decay:.14}),this.tone(560,{type:"square",peak:.09,attack:.005,decay:.16,when:.16})}impact(t=1){this.noiseBurst({peak:.16*Math.min(1.4,t),attack:.004,decay:.42,freq:900,type:"lowpass",sweepTo:90}),this.tone(70,{type:"sine",peak:.18*t,attack:.005,decay:.5,slideTo:34})}proximity(){const t=performance.now();t-this._lastBeep<420||(this._lastBeep=t,this.tone(1040,{type:"triangle",peak:.05,attack:.003,decay:.09}))}missionComplete(){[392,523.25,659.25,783.99,1046.5].forEach((e,n)=>{this.tone(e,{type:"triangle",peak:.13,attack:.012,decay:.7,when:n*.11})})}setMuted(t){this.muted=t,this._applyVolume()}setVolume(t){this.masterVolume=Math.max(0,Math.min(1,t)),this._applyVolume()}_applyVolume(){if(!this.ready)return;const t=this.muted?0:this.masterVolume;this._nodes.master.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}suspend(){this.ready&&this.ctx.state==="running"&&this.ctx.suspend()}resume(){this.ready&&this.ctx.state==="suspended"&&this.ctx.resume()}}const An=100,Ae={id:"irda",name:"伊尔达",nameEn:"Irda",kind:"star",position:new T(9e3,2200,-7600),radius:1200,color:16773320,glow:16763274,scanRange:5200,summary:"G2V 主序星。表面温度 5,780 K，是这个空隙里唯一的光源与热量。",summaryEn:"G2V main-sequence star. Surface temperature 5,780 K — the only source of light and heat in this gap."},Ge=[{id:"velan",name:"维岚",nameEn:"Velan",kind:"planet",position:new T(0,0,0),radius:800,atmosphere:1.055,atmoColor:16758903,atmoIntensity:1.05,rotation:.0042,axialTilt:.19,texturePreset:"velan",seed:4211,scanRange:1800,summary:"气态巨行星。氮与甲烷构成的大气被切成无数条带，赤道风速常年 1,200 km/h。",summaryEn:"Gas giant. A nitrogen–methane atmosphere sliced into countless bands; equatorial winds hold at 1,200 km/h."},{id:"frostgap",name:"霜隙",nameEn:"Frostgap",kind:"planet",position:new T(-2600,0,1500),radius:520,atmosphere:1.04,atmoColor:11065584,atmoIntensity:.9,rotation:-.0065,axialTilt:.62,texturePreset:"frostgap",seed:9021,ring:{inner:760,outer:1180,tilt:.62,color:16773852},scanRange:1500,summary:"冰巨星。环系由十亿年的冰晶碎屑构成，环面留有一道明显的卡西尼式空隙。",summaryEn:"Ice giant. Its ring system is a billion years of ice debris, with a clear Cassini-style gap across the ring plane."}],Ar=[{id:"korai",name:"柯莱",nameEn:"Korai",kind:"moon",parent:"velan",position:new T(-720,360,700),radius:96,rotation:.011,texturePreset:"korai",seed:3311,scanRange:700,summary:"维岚内侧卫星。富集金属矿脉，密集的陨击坑记录着一颗被拆散的卫星系统。",summaryEn:"Inner moon of Velan. Rich in metal veins; dense impact craters record a moon system torn apart."},{id:"morn",name:"莫恩",nameEn:"Morn",kind:"moon",parent:"frostgap",position:new T(-2600,620,1830),radius:72,rotation:-.019,texturePreset:"morn",seed:7717,scanRange:700,summary:"霜隙外侧冰卫星。氨冰壳下检测到未知有机分子信号，来源未明。",summaryEn:"Outer ice moon of Frostgap. Unknown organic molecular signals detected under an ammonia crust; origin unknown."}],Vo=[{id:"anomaly-hollow",name:"空心骨",nameEn:"Hollow Bone",kind:"anomaly",position:new T(2145,95,-1060),radius:26,scanRange:420,summary:"中空金属结构，内部完全空腔。材质不属于任何已知工业合金。",summaryEn:"Hollow metal structure with a completely empty interior. The alloy matches no known industrial material."},{id:"anomaly-spindle",name:"纺锤遗物",nameEn:"Spindle Relic",kind:"anomaly",position:new T(1985,-40,-1385),radius:34,scanRange:420,summary:"自转轴对称的人工形态残片，边缘有规则切口，疑似工程弃置物。",summaryEn:"An artificial fragment symmetric about its spin axis, with regular cuts along the rim — possibly discarded engineering."},{id:"anomaly-signal",name:"回声信标",nameEn:"Echo Beacon",kind:"anomaly",position:new T(2290,20,-1340),radius:18,scanRange:420,summary:"持续发出 17.4 kHz 窄带信号，脉冲间隔与人类标准计时完全一致。",summaryEn:"Emits a continuous 17.4 kHz narrow-band signal whose pulse interval matches human standard timing exactly."}],ue={center:new T(2100,40,-1200),majorRadius:430,tubeRadius:165,scaleMin:3,scaleMax:22,rotationAxis:new T(.18,1,-.12).normalize()},kt={id:"beacon",name:"灯塔站",nameEn:"Beacon Station",kind:"station",position:new T(620,430,520),coreRadius:11,ringRadius:31,dockOffset:new T(0,34,0),dockRadius:13,scanRange:420,summary:"维岚轨道中继站。四座船坞，常驻补给、船员轮换与远航记录归档。",summaryEn:"Relay station in Velan orbit. Four berths, standing resupply, crew rotation and voyage-record archiving."},Me={id:"kalso-array",name:"卡尔索阵列",nameEn:"Kalso Array",kind:"derelict",position:new T(2100,40,-1200),radius:34,scanRange:420,summary:"废弃的中继阵列。表面覆满微陨石撞击坑，没有任何生命迹象。",summaryEn:"Abandoned relay array. Its surface is cratered by micrometeorites; no sign of life anywhere."},vh=[{id:"velan-orbit",name:"维岚轨道",nameEn:"Velan Orbit",center:new T(0,0,0),radius:1600,color:16758903,description:"气态巨行星维岚与灯塔站所在的轨道带。",descriptionEn:"The orbital band holding gas giant Velan and Beacon Station."},{id:"debris-gallery",name:"碎屑回廊",nameEn:"Debris Gallery",center:ue.center.clone(),radius:760,color:14201994,description:"密集岩屑带。碰撞风险高，但藏有三处未登记的异常体。",descriptionEn:"A dense rock belt. Collision risk is high, but three unlogged anomalies hide here."},{id:"frostgap-system",name:"霜隙环系",nameEn:"Frostgap System",center:Ge[1].position.clone(),radius:1500,color:11065584,description:"冰巨星霜隙及其环系，卫星莫恩位于外侧轨道。",descriptionEn:"Ice giant Frostgap and its rings; moon Morn rides the outer orbit."},{id:"irda",name:"伊尔达",nameEn:"Irda",center:Ae.position.clone(),radius:4200,color:16765066,description:"主序星伊尔达。日冕活动强烈，辐射带极其危险。",descriptionEn:"Main-sequence star Irda. Strong coronal activity, and the radiation belts are lethal."}],ae={thrustAccel:.85,boostMultiplier:5.2,lateralAccel:.52,verticalAccel:.46,maxSpeed:42,boostFuelPerSecond:13,fuelCapacity:100,hullMax:100,assistDamping:.28,mouseGain:.0021,keyRate:.95,rollRate:1.55,eyeOffset:new T(0,.06,.28)},Ma={position:new T(620,469,520),lookAt:new T(670,439,439),velocity:new T(0,0,0)},ys=[...Ge,...Ar,...Vo,Ae,kt,Me].map(i=>({id:i.id,name:i.name,nameEn:i.nameEn??i.name,kind:i.kind,position:i.position.clone(),radius:i.radius??10,scanRange:i.scanRange??500,summary:i.summary??"",summaryEn:i.summaryEn??""})),hc={planet:"行星",moon:"卫星",star:"恒星",station:"空间站",derelict:"废弃结构",anomaly:"异常体"},uc={planet:"Planet",moon:"Moon",star:"Star",station:"Station",derelict:"Derelict",anomaly:"Anomaly"};function Cr(i,{srgb:t=!0,repeat:e=null,aniso:n=1}={}){const s=new po(i);return t&&(s.colorSpace=Xe),s.wrapS=Xi,s.wrapT=Xi,e&&s.repeat.set(e[0],e[1]),s.anisotropy=n,s.needsUpdate=!0,s}function Vi(i){let t=i>>>0;return function(){t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Rn(i,t,e,n){let s=i*374761393+t*668265263+e*2147483647+n*1013904223;return s=(s^s>>>13)>>>0,s=Math.imul(s,1274126177)>>>0,((s^s>>>16)>>>0)/4294967296}function cr(i,t,e){return Rn(i,t,0,e)}const Ms=i=>i*i*(3-2*i),mn=(i,t,e)=>i+(t-i)*e;function Cs(i=1337){return function(e,n,s){const r=Math.floor(e),a=Math.floor(n),o=Math.floor(s),l=Ms(e-r),c=Ms(n-a),h=Ms(s-o),u=Rn(r,a,o,i),d=Rn(r+1,a,o,i),p=Rn(r,a+1,o,i),g=Rn(r+1,a+1,o,i),_=Rn(r,a,o+1,i),f=Rn(r+1,a,o+1,i),m=Rn(r,a+1,o+1,i),M=Rn(r+1,a+1,o+1,i),x=mn(u,d,l),y=mn(p,g,l),L=mn(_,f,l),R=mn(m,M,l);return mn(mn(x,y,c),mn(L,R,c),h)}}function fi(i=7331){return function(e,n){const s=Math.floor(e),r=Math.floor(n),a=Ms(e-s),o=Ms(n-r),l=cr(s,r,i),c=cr(s+1,r,i),h=cr(s,r+1,i),u=cr(s+1,r+1,i);return mn(mn(l,c,a),mn(h,u,o),o)}}function Ke(i,t,e,n=5,s=2,r=.5){let a=1,o=1,l=0,c=0;for(let h=0;h<n;h++)l+=a*i(t*o,e*o),c+=a,a*=r,o*=s;return l/c}function Rs(i,t,e,n,s=5,r=2,a=.5){let o=1,l=1,c=0,h=0;for(let u=0;u<s;u++)c+=o*i(t*l,e*l,n*l),h+=o,o*=a,l*=r;return c/h}function Go(i,t,e,n,s=5){let r=.5,a=1,o=0,l=0;for(let c=0;c<s;c++){const h=1-Math.abs(i(t*a,e*a,n*a)*2-1);o+=r*h*h,l+=r,r*=.55,a*=2.1}return o/l}function Wn(i,t,e){return[i[0]+(t[0]-i[0])*e,i[1]+(t[1]-i[1])*e,i[2]+(t[2]-i[2])*e]}function ge(i){return[(i>>16&255)/255,(i>>8&255)/255,(i&255)/255]}function xn(i,t,e){const n=Math.min(1,Math.max(0,(e-i)/(t-i)));return n*n*(3-2*n)}const dc={velan:{type:"gas",base:ge(6964518),bands:[ge(14263395),ge(9065520),ge(15916203),ge(5124120)],storm:ge(11815460)},frostgap:{type:"ice",base:ge(2574944),bands:[ge(11131116),ge(4161439),ge(15135995),ge(1782856)],storm:ge(14087167)},korai:{type:"rock",base:ge(6642254),bands:[ge(10127475),ge(4537651),ge(7627599)],storm:ge(12627086)},morn:{type:"ice",base:ge(3487823),bands:[ge(9278144),ge(2171959),ge(13225452)],storm:ge(14869752)}};function fc(i={}){const{width:t=1024,height:e=512,seed:n=42,preset:s="verdance",bandCount:r=9,bandWarp:a=.06,stormCount:o=3}=i,l=dc[s]||dc.velan,c=Cs(n),h=fi(n+17),u=Vi(n+99),d=document.createElement("canvas");d.width=t,d.height=e;const p=d.getContext("2d"),g=p.createImageData(t,e),_=g.data,f=[];for(let m=0;m<o;m++)f.push({lon:u()*Math.PI*2,lat:(u()-.5)*Math.PI*.75,r:.16+u()*.22,spin:(u()-.5)*.9,strength:.55+u()*.45});for(let m=0;m<e;m++){const M=m/e,x=(M-.5)*Math.PI,y=Math.cos(x);for(let L=0;L<t;L++){const R=L/t,b=R*Math.PI*2,P=(Ke(h,R*5.5,M*3.1,3)-.5)*a,N=(M+P)*r,v=Math.floor(N),w=N-v,O=l.bands[(v%l.bands.length+l.bands.length)%l.bands.length],B=l.bands[((v+1)%l.bands.length+l.bands.length)%l.bands.length];let k=Wn(O,B,xn(.25,.75,w)*.55+.2);const X=Rs(c,Math.cos(b)*y*2.6,Math.sin(b)*y*2.6,x*2.6,4);k=Wn(k,l.base,.18+X*.34);const z=Math.pow(Math.abs(Math.sin(x)),6);if(k=Wn(k,[.92,.95,1],z*.5),l.type==="rock"||l.type==="ice"){const H=Go(c,Math.cos(b)*y*9+11,Math.sin(b)*y*9,x*9,4);k=Wn(k,[.08,.08,.1],xn(.55,.95,H)*.5),k=Wn(k,[.85,.85,.9],xn(.72,.98,1-H)*.18)}for(const H of f){let at=b-H.lon;for(;at>Math.PI;)at-=Math.PI*2;for(;at<-Math.PI;)at+=Math.PI*2;const ft=x-H.lat;if(Math.abs(at)>H.r*1.4||Math.abs(ft)>H.r*.8)continue;const pt=Math.sqrt((at/H.r)**2+(ft/(H.r*.55))**2);if(pt<1.4){const Vt=Ke(h,b*9+H.spin,x*9,3),Wt=xn(1.25,.15,pt)*(.55+Vt*.8);k=Wn(k,H.storm?l.storm:k,Math.min(1,Wt*H.strength))}}const j=(m*t+L)*4;_[j]=Math.max(0,Math.min(255,k[0]*255)),_[j+1]=Math.max(0,Math.min(255,k[1]*255)),_[j+2]=Math.max(0,Math.min(255,k[2]*255)),_[j+3]=255}}return p.putImageData(g,0,0),d}function Cg(i=909,t=2048){const e=document.createElement("canvas");e.width=t,e.height=4;const n=e.getContext("2d"),s=n.createImageData(t,4),r=s.data,a=fi(i),o=Vi(i+5),l=[];for(let c=0;c<7;c++)l.push({pos:.05+o()*.9,w:.004+o()*.02,d:.35+o()*.65});for(let c=0;c<t;c++){const h=c/t;let u=.42+.5*Ke(a,h*60,3.1,5);u*=.55+.45*Math.abs(Math.sin(h*340+Ke(a,h*20,7,3)*8));for(const g of l){const _=Math.abs(h-g.pos);_<g.w&&(u*=1-g.d*(1-_/g.w))}u*=xn(0,.09,h)*xn(1,.91,h),u=Math.max(0,Math.min(1,u));const d=Ke(a,h*9,12.7,3),p=Wn([.72,.78,.88],[.92,.82,.66],d);for(let g=0;g<4;g++){const _=(g*t+c)*4;r[_]=p[0]*255*(.65+u*.55),r[_+1]=p[1]*255*(.65+u*.55),r[_+2]=p[2]*255*(.65+u*.55),r[_+3]=255*u}}return n.putImageData(s,0,0),e}function Rg(i=1536,t=768,e=2024){const n=document.createElement("canvas");n.width=i,n.height=t;const s=n.getContext("2d"),r=s.createImageData(i,t),a=r.data,o=Cs(e),l=fi(e+31),c=[[.02,.024,.062],[.042,.03,.098],[.1,.04,.126],[.026,.06,.104],[.034,.082,.112],[.12,.056,.06]];for(let h=0;h<t;h++){const u=h/t,d=(u-.5)*Math.PI,p=Math.cos(d);for(let g=0;g<i;g++){const _=g/i,f=_*Math.PI*2,m=Math.cos(f)*p,M=Math.sin(d),x=Math.sin(f)*p,y=Ke(l,_*3.1,u*2.2,2)-.5,L=Ke(l,_*2.3+4,u*1.9,2)-.5,R=Rs(o,m*2.1+y*1.4,M*2.1+L*1.4,x*2.1,4),b=Go(o,m*3.4+y,M*3.4+L,x*3.4,3),P=xn(.42,.86,R),N=Math.min(1,P*.85+b*.42),v=Ke(l,_*3.1,u*2.2,3)*(c.length-1)|0,w=c[Math.max(0,Math.min(c.length-1,v))],O=N*N,B=w[0]*O*1.25,k=w[1]*O*1.25,X=w[2]*O*1.25,z=(h*i+g)*4;a[z]=Math.min(255,(B+.012)*255),a[z+1]=Math.min(255,(k+.014)*255),a[z+2]=Math.min(255,(X+.028)*255),a[z+3]=255}}return s.putImageData(r,0,0),n}function Ho(i=512,t=77,e=[.3,.33,.38]){const n=document.createElement("canvas");n.width=i,n.height=i;const s=n.getContext("2d"),r=fi(t),a=Vi(t+3),o=s.createImageData(i,i);for(let l=0;l<i;l++)for(let c=0;c<i;c++){const h=Ke(r,c*.06,l*.06,4),u=xn(.62,.98,Ke(r,c*.9,l*.02,2)),d=[e[0]*(.72+h*.55)+u*.12,e[1]*(.72+h*.55)+u*.12,e[2]*(.72+h*.55)+u*.12],p=(l*i+c)*4;o.data[p]=Math.min(255,d[0]*255),o.data[p+1]=Math.min(255,d[1]*255),o.data[p+2]=Math.min(255,d[2]*255),o.data[p+3]=255}s.putImageData(o,0,0),s.strokeStyle="rgba(0,0,0,0.42)",s.lineWidth=1;for(let l=0;l<26;l++){const c=Math.floor(a()*i),h=Math.floor(a()*i),u=30+a()*160,d=24+a()*140;s.strokeRect(c,h,u,d)}s.strokeStyle="rgba(255,255,255,0.05)";for(let l=0;l<18;l++){const c=Math.floor(a()*i),h=Math.floor(a()*i);s.strokeRect(c,h,20+a()*90,18+a()*70)}return n}function _h(i=256,t=21){const e=document.createElement("canvas");e.width=i,e.height=i;const n=e.getContext("2d"),s=fi(t),r=n.createImageData(i,i);for(let a=0;a<i;a++)for(let o=0;o<i;o++){const c=110+Ke(s,o*.05,a*.05,4)*120,h=(a*i+o)*4;r.data[h]=c,r.data[h+1]=c,r.data[h+2]=c,r.data[h+3]=255}return n.putImageData(r,0,0),e}function pc(i=256,t="rgba(255,255,255,1)",e="rgba(255,255,255,0)",n=1){const s=document.createElement("canvas");s.width=i,s.height=i;const r=s.getContext("2d"),a=r.createRadialGradient(i/2,i/2,0,i/2,i/2,i/2);return a.addColorStop(0,t),a.addColorStop(Math.min(.85,.28*n),"rgba(255,255,255,0.35)"),a.addColorStop(1,e),r.fillStyle=a,r.fillRect(0,0,i,i),s}function Pg(i=512,t=256,e=3141){const n=document.createElement("canvas");n.width=i,n.height=t;const s=n.getContext("2d"),r=s.createImageData(i,t),a=r.data,o=Cs(e),l=fi(e+77);for(let c=0;c<t;c++){const h=c/t,u=(h-.5)*Math.PI,d=Math.cos(u);for(let p=0;p<i;p++){const g=p/i,_=g*Math.PI*2,f=Math.cos(_)*d,m=Math.sin(u),M=Math.sin(_)*d,x=Rs(o,f*12,m*12,M*12,4),y=Go(o,f*26,m*26,M*26,3),L=xn(.62,.92,Ke(l,g*7,h*5,4));let R=.52+x*.42+y*.18+L*.35;const b=xn(.8,.96,Ke(l,g*4+3,h*3,3));R*=1-b*.45;const P=Wn([1,.72,.38],[1,.98,.9],Math.min(1,R)),N=(c*i+p)*4;a[N]=Math.min(255,P[0]*255),a[N+1]=Math.min(255,P[1]*255),a[N+2]=Math.min(255,P[2]*255),a[N+3]=255}}return s.putImageData(r,0,0),n}function Lg(i,{fg:t="#E9A93D",bg:e="rgba(10,7,4,0.94)",font:n='bold 54px "Menlo", "Consolas", monospace',width:s=512,height:r=128,sub:a="",subColor:o="rgba(243,231,210,0.62)"}={}){const l=document.createElement("canvas");l.width=s,l.height=r;const c=l.getContext("2d");return c.fillStyle=e,c.fillRect(0,0,s,r),c.strokeStyle=t,c.globalAlpha=.55,c.lineWidth=4,c.strokeRect(6,6,s-12,r-12),c.globalAlpha=1,c.fillStyle=t,c.font=n,c.textAlign="center",c.textBaseline="middle",c.shadowColor=t,c.shadowBlur=18,c.fillText(i,s/2,a?r/2-14:r/2),c.shadowBlur=0,a&&(c.fillStyle=o,c.font='26px "Menlo", "Consolas", monospace',c.fillText(a,s/2,r/2+30)),l}function Dg(i=256,t=5150){const e=document.createElement("canvas");e.width=i,e.height=i;const n=e.getContext("2d"),s=fi(t),r=n.createImageData(i,i);for(let a=0;a<i;a++)for(let o=0;o<i;o++){const c=40+Ke(s,o*.08,a*.08,5)*200,h=(a*i+o)*4;r.data[h]=c,r.data[h+1]=c*.96,r.data[h+2]=c*.9,r.data[h+3]=255}return n.putImageData(r,0,0),e}const Ig=`
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm3(vec3 p, int oct){
    float a = 0.5, s = 0.0, n = 0.0;
    for(int i = 0; i < 6; i++){
      if(i >= oct) break;
      s += a * snoise(p);
      n += a;
      a *= 0.5;
      p *= 2.03;
    }
    return s / n;
  }
`,mc=`
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main(){
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`,gc=`
  uniform vec3  uColor;
  uniform vec3  uSunDir;
  uniform vec3  uCamPos;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uHaze;
  uniform float uSunBoost;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main(){
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    float facing = abs(dot(N, V));
    float fres = pow(clamp(1.0 - facing, 0.0, 1.0), uPower);
    float sun = clamp(dot(N, uSunDir) * 0.5 + 0.5, 0.0, 1.0);
    sun = pow(sun, uSunBoost);
    vec3 c = uColor * (0.22 + 1.25 * sun);
    float a = (fres * uIntensity) + (uHaze * pow(sun, 2.0) * 0.35);
    a = clamp(a, 0.0, 1.0);
    gl_FragColor = vec4(c * a, a);
  }
`;function Ug({radius:i,color:t=6924543,intensity:e=1.15,power:n=3,haze:s=.22}){const r=new de,a={uColor:{value:new Ut(t)},uSunDir:{value:new T(1,0,0)},uCamPos:{value:new T},uPower:{value:n},uIntensity:{value:e},uHaze:{value:s},uSunBoost:{value:1.4}},o=new it(new Le(i*1.055,96,64),new he({vertexShader:mc,fragmentShader:gc,uniforms:a,transparent:!0,blending:Oe,depthWrite:!1,side:De}));o.renderOrder=2,r.add(o);const l=new it(new Le(i*1.004,96,64),new he({vertexShader:mc,fragmentShader:gc,uniforms:a,transparent:!0,blending:Oe,depthWrite:!1,side:Un}));return l.renderOrder=3,r.add(l),r.userData.uniforms=a,r.userData.halo=o,r.userData.veil=l,r}const Ng=`
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main(){
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`,Fg=`
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform vec3 uCamPos;
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main(){
    vec3 tex = texture2D(uMap, vUv).rgb;
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    float mu = clamp(dot(N, V), 0.0, 1.0);
    // Limb darkening
    float limb = 0.30 + 0.70 * pow(mu, 0.42);
    // Slow roiling granulation
    float roll = 0.86 + 0.22 * sin(uTime * 0.55 + tex.r * 12.0 + tex.b * 6.0);
    vec3 c = tex * uColor * limb * roll * uIntensity;
    gl_FragColor = vec4(c, 1.0);
  }
`;function Og(i,t=16773312){const e={uMap:{value:i},uColor:{value:new Ut(t)},uCamPos:{value:new T},uTime:{value:0},uIntensity:{value:3.4}},n=new it(new Le(1,96,64),new he({vertexShader:Ng,fragmentShader:Fg,uniforms:e}));return n.userData.uniforms=e,n}const Bg=`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,kg=`
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying vec2 vUv;

  void main(){
    vec4 t = texture2D(uMap, vUv);
    float pulse = 0.94 + 0.06 * sin(uTime * 1.7);
    gl_FragColor = vec4(uColor * t.rgb * uIntensity * pulse, t.a * uIntensity);
  }
`;function Sa(i,t=16767392,e=1){const n={uMap:{value:i},uColor:{value:new Ut(t)},uIntensity:{value:e},uTime:{value:0}},s=new he({vertexShader:Bg,fragmentShader:kg,uniforms:n,transparent:!0,blending:Oe,depthWrite:!1,depthTest:!0}),r=new b0(s);return r.userData.uniforms=n,r}const zg=`
  varying vec3 vLocal;
  varying vec3 vWorldPos;
  void main(){
    vLocal = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`,Vg=`
  uniform sampler2D uBands;
  uniform float uInner;
  uniform float uOuter;
  uniform vec3  uColor;
  uniform vec3  uSunDir;
  uniform vec3  uPlanetCenter;
  uniform float uPlanetRadius;
  uniform vec3  uCamPos;
  varying vec3 vLocal;
  varying vec3 vWorldPos;

  void main(){
    float r = length(vLocal.xy);
    float t = (r - uInner) / max(0.0001, (uOuter - uInner));
    if(t < 0.0 || t > 1.0) discard;

    vec4 band = texture2D(uBands, vec2(t, 0.5));
    float alpha = band.a;

    // Planet shadow: is the ring point inside the planet's shadow cylinder?
    vec3 d = vWorldPos - uPlanetCenter;
    float proj = dot(d, uSunDir);
    float shadow = 1.0;
    if(proj > 0.0){
      vec3 closest = d - uSunDir * proj;
      float dist = length(closest);
      shadow = smoothstep(uPlanetRadius * 0.96, uPlanetRadius * 1.06, dist);
    }

    // Forward scattering: rings brighten when viewed against the sun
    vec3 V = normalize(uCamPos - vWorldPos);
    float fwd = pow(clamp(dot(-V, uSunDir), 0.0, 1.0), 3.0);

    vec3 c = band.rgb * uColor * (0.32 + 0.95 * shadow) * (1.0 + fwd * 1.5);
    gl_FragColor = vec4(c, alpha * (0.35 + 0.65 * shadow));
  }
`;function Gg({inner:i,outer:t,bandMap:e,color:n=16777215,planetRadius:s}){const r=new Bo(i,t,256,4),a=r.attributes.position,o=r.attributes.uv;for(let h=0;h<a.count;h++){const u=a.getX(h),d=a.getY(h),p=Math.sqrt(u*u+d*d);o.setXY(h,(p-i)/(t-i),.5)}o.needsUpdate=!0;const l={uBands:{value:e},uInner:{value:i},uOuter:{value:t},uColor:{value:new Ut(n)},uSunDir:{value:new T(1,0,0)},uPlanetCenter:{value:new T},uPlanetRadius:{value:s},uCamPos:{value:new T}},c=new it(r,new he({vertexShader:zg,fragmentShader:Vg,uniforms:l,transparent:!0,side:Fe,depthWrite:!1}));return c.userData.uniforms=l,c.renderOrder=1,c}const Hg=`
  uniform float uIntensity;
  uniform float uTime;
  uniform vec3  uTint;
  varying vec2 vUv;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main(){
    if(uIntensity <= 0.001) discard;
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    vec2 dir = r > 0.0001 ? uv / r : vec2(0.0);

    // Radial streak field
    float streak = 0.0;
    for(int i = 0; i < 3; i++){
      float scale = 42.0 + float(i) * 31.0;
      float ang = atan(dir.y, dir.x);
      float band = hash(vec2(floor(ang * scale), float(i) * 7.0));
      float phase = fract(band * 9.0 + uTime * (2.4 + float(i) * 1.3));
      float line = smoothstep(0.92, 1.0, 1.0 - abs(fract(ang * scale) - 0.5) * 2.0);
      streak += line * pow(phase, 5.0);
    }

    float radial = smoothstep(0.06, 0.72, r);
    float core = smoothstep(0.5, 0.0, r) * 0.6;
    float a = (streak * radial * 1.4 + core) * uIntensity;
    gl_FragColor = vec4(uTint * a, a);
  }
`;function Wg(){const i={uIntensity:{value:0},uTime:{value:0},uTint:{value:new Ut(10475775)}},t=new ah,e=new Io(-1,1,1,-1,0,1),n=new it(new Fn(2,2),new he({vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:Hg,uniforms:i,transparent:!0,blending:Oe,depthTest:!1,depthWrite:!1}));return n.frustumCulled=!1,t.add(n),{scene:t,camera:e,uniforms:i,quad:n}}const Xg=`
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  ${Ig}

  void main(){
    vec3 p = normalize(vWorldPos);
    float n = fbm3(p * 2.4 + vec3(0.0, uTime * 0.01, 0.0), 4);
    float d = smoothstep(0.05, 0.72, n);
    vec3 c = mix(uColorA, uColorB, smoothstep(-0.2, 0.6, n));
    gl_FragColor = vec4(c * d * uOpacity, d * uOpacity);
  }
`,qg=`
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main(){
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;function Yg({radius:i,colorA:t=2764666,colorB:e=10174351,opacity:n=.5}){const s={uColorA:{value:new Ut(t)},uColorB:{value:new Ut(e)},uTime:{value:0},uOpacity:{value:n}},r=new it(new Le(i,64,48),new he({vertexShader:qg,fragmentShader:Xg,uniforms:s,transparent:!0,blending:Oe,depthWrite:!1,side:De}));return r.userData.uniforms=s,r.renderOrder=-10,r}const Kg=`
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uMode;
  varying vec2 vUv;

  float ring(float d, float r, float w){ return smoothstep(w, 0.0, abs(d - r)); }

  void main(){
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    float a = 0.0;

    // Outer reticle ring with tick marks
    a += ring(r, 0.34, 0.006) * 0.9;
    float ang = atan(uv.y, uv.x);
    float ticks = smoothstep(0.86, 1.0, abs(sin(ang * 12.0)));
    a += ring(r, 0.40, 0.004) * ticks * 0.8;

    // Inner cross
    float cross = 0.0;
    cross += smoothstep(0.0035, 0.0, abs(uv.x)) * smoothstep(0.16, 0.03, abs(uv.y));
    cross += smoothstep(0.0035, 0.0, abs(uv.y)) * smoothstep(0.16, 0.03, abs(uv.x));
    a += cross * 0.85;

    // Centre pip
    a += smoothstep(0.012, 0.004, r) * 1.2;

    // Scan sweep
    float sweep = fract(ang / 6.2831853 + uTime * 0.18);
    a += ring(r, 0.34, 0.02) * pow(1.0 - sweep, 9.0) * 0.55;

    // Target bracket mode
    if(uMode > 0.5){
      float bx = smoothstep(0.16, 0.15, abs(abs(uv.x) - 0.12)) * smoothstep(0.22, 0.10, abs(uv.y));
      float by = smoothstep(0.16, 0.15, abs(abs(uv.y) - 0.12)) * smoothstep(0.22, 0.10, abs(uv.x));
      a += (bx + by) * 0.8;
    }

    a *= uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;function $g(i=6547711,t=.55){const e={uColor:{value:new Ut(i)},uOpacity:{value:t},uTime:{value:0},uMode:{value:0}},n=new it(new Fn(.72,.72),new he({vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:Kg,uniforms:e,transparent:!0,blending:Oe,depthWrite:!1,depthTest:!1}));return n.userData.uniforms=e,n.renderOrder=30,n}const jg=`
  uniform vec3 uColorCore;
  uniform vec3 uColorEdge;
  uniform float uTime;
  uniform float uPower;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.7, 289.3))) * 43758.5453); }

  void main(){
    float t = vUv.y;
    float n = hash(floor(vec2(vUv.x * 22.0, vUv.y * 34.0 - uTime * 9.0)));
    float flick = 0.82 + 0.18 * n;
    float core = pow(t, 1.9);
    float edge = smoothstep(0.0, 0.35, abs(vUv.x - 0.5) * 2.0);
    vec3 c = mix(uColorCore, uColorEdge, t * 0.9);
    float a = core * flick * uPower * mix(0.35, 1.0, edge);
    gl_FragColor = vec4(c * a, a);
  }
`;function Jg(i=1,t=.2,e=10478847,n=2776319){const s={uColorCore:{value:new Ut(e)},uColorEdge:{value:new Ut(n)},uTime:{value:0},uPower:{value:0}},r=new it(new Dr(t,i,20,6,!0),new he({vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:jg,uniforms:s,transparent:!0,blending:Oe,depthWrite:!1,side:Fe}));return r.userData.uniforms=s,r}function xo(){return new Promise(i=>{if(typeof MessageChannel>"u"){setTimeout(i,0);return}const t=new MessageChannel;t.port1.onmessage=()=>{t.port1.close(),i()},t.port2.postMessage(null)})}const wa=new T(0,1,0);function un(i,{srgb:t=!0,repeat:e=null,aniso:n=1}={}){return Cr(i,{srgb:t,repeat:e,aniso:n})}class vc{constructor(t,e){this.scene=t,this.quality=e,this.root=new de,this.root.name="universe",t.add(this.root),this.elapsed=0,this.sunDir=new T(1,0,0),this.atmosphereGroups=[],this.ringMeshes=[],this.spinners=[],this.blinkers=[],this.asteroidInstances=[],this.beltBounds=null,this._tmpV=new T,this._tmpV2=new T,this._tmpQ=new rn,this._up=new T(0,1,0)}async build(t=()=>{}){const e=async(n,s,r)=>{t(n,s),await xo();const a=performance.now(),o=r(),l=performance.now()-a;return l>40&&console.info(`[build] ${n} → ${l.toFixed(0)}ms`),o};await e("织造星云背景",.1,()=>this._buildSkybox()),await e("播撒恒星场",.2,()=>this._buildStarfield()),await e("点燃伊尔达",.3,()=>this._buildStar()),await e("塑造维岚",.44,()=>this._buildPlanet(Ge[0])),await e("塑造霜隙环系",.56,()=>this._buildPlanet(Ge[1])),await e("安置柯莱与莫恩",.64,()=>this._buildMoons()),await e("填充碎屑回廊",.74,()=>this._buildBelt()),await e("建造灯塔站",.84,()=>this._buildStation()),await e("标记卡尔索阵列",.9,()=>this._buildDerelict()),await e("登记异常信号源",.96,()=>this._buildAnomalies()),await e("校准导航系统",1,()=>{const n=new _r(16773330,3.1,0,0);n.position.copy(Ae.position),this.root.add(n),this.sunLight=n;const s=new lg(3813202,658454,.55);this.root.add(s),this.fillLight=s;const r=new ug(3023928,.35);this.root.add(r)})}_buildSkybox(){const t=un(Rg(this.quality.nebulaTexture,Math.round(this.quality.nebulaTexture/2),2024));t.wrapS=Xi;const e=new it(new Le(19e3,64,48),new Se({map:t,side:De,depthWrite:!1,fog:!1}));if(e.renderOrder=-100,e.frustumCulled=!1,this.root.add(e),this.skybox=e,this.quality.nebulaShell){const n=Yg({radius:17500,colorA:2830202,colorB:9386630,opacity:.34});this.root.add(n),this.nebulaShell=n}}_buildStarfield(){const t=this.quality.stars,e=Vi(4242),n=new Float32Array(t*3),s=new Float32Array(t*3),r=new Float32Array(t),a=new Ut;for(let h=0;h<t;h++){const u=e()*2-1,d=e()*Math.PI*2,p=Math.sqrt(1-u*u),g=17500;n[h*3]=Math.cos(d)*p*g,n[h*3+1]=u*g,n[h*3+2]=Math.sin(d)*p*g;const _=e();_<.08?a.setHSL(.06,.75,.72):_<.2?a.setHSL(.11,.55,.8):_<.52?a.setHSL(.58,.18,.86):_<.78?a.setHSL(.6,.45,.84):a.setHSL(.13,.25,.9);const f=.55+Math.pow(e(),3)*.9;s[h*3]=a.r*f,s[h*3+1]=a.g*f,s[h*3+2]=a.b*f,r[h]=.9+Math.pow(e(),4)*2.6}const o=new we;o.setAttribute("position",new Be(n,3)),o.setAttribute("color",new Be(s,3)),o.setAttribute("aSize",new Be(r,1));const l=new he({uniforms:{uTime:{value:0}},vertexShader:`
        attribute float aSize;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;
        void main(){
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vTwinkle = 0.75 + 0.25 * sin(uTime * 1.6 + position.x * 0.013 + position.z * 0.017);
          gl_PointSize = aSize * vTwinkle;
          gl_Position = projectionMatrix * mv;
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vTwinkle;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.06, d);
          gl_FragColor = vec4(vColor * vTwinkle, a);
        }
      `,vertexColors:!0,transparent:!0,blending:Oe,depthWrite:!1}),c=new jl(o,l);c.renderOrder=-50,c.frustumCulled=!1,this.root.add(c),this.starfield=c,this.starfieldMat=l}_buildStar(){const t=un(Pg(512,256,3141)),e=Og(t,Ae.color);e.scale.setScalar(Ae.radius),e.position.copy(Ae.position),this.root.add(e),this.starSurface=e;const n=un(pc(256,"rgba(255,235,190,1)","rgba(255,140,40,0)",1),{srgb:!0}),s=Sa(n,16771504,.72);s.scale.setScalar(Ae.radius*2.9),s.position.copy(Ae.position),s.renderOrder=1,this.root.add(s),this.starGlow=s;const r=Sa(n,16751676,.26);r.scale.setScalar(Ae.radius*4.8),r.position.copy(Ae.position),r.renderOrder=0,this.root.add(r),this.starGlowOuter=r}_buildPlanet(t){const e=new de;e.position.copy(t.position),this.root.add(e);const n=un(fc({width:this.quality.planetTexture,height:Math.round(this.quality.planetTexture/2),seed:t.seed,preset:t.texturePreset}),{aniso:this.quality.anisotropy}),s=new Le(t.radius,96,64),r=new fe({map:n,roughness:.92,metalness:0}),a=new it(s,r);e.add(a);const o=new de;o.rotation.z=t.axialTilt,e.add(o);const l=new de;o.add(l);const c=new it(s,r);l.add(c);const h=Ug({radius:t.radius,color:t.atmoColor,intensity:t.atmoIntensity,power:3.1,haze:.3});if(o.add(h),this.atmosphereGroups.push(h),t.ring){const u=un(Cg(909),{srgb:!0,aniso:this.quality.anisotropy});u.wrapS=qn;const d=Gg({inner:t.ring.inner,outer:t.ring.outer,bandMap:u,color:t.ring.color,planetRadius:t.radius});d.rotation.x=-Math.PI/2;const p=new de;p.rotation.z=t.ring.tilt,p.add(d),o.add(p),this.ringMeshes.push(d)}this.spinners.push({node:l,speed:t.rotation}),this.planets=this.planets||{},this.planets[t.id]={def:t,group:e,body:a,atmo:h,pivot:o}}_buildMoons(){this.moons={};for(const t of Ar){const e=new de;e.position.copy(t.position),this.root.add(e);const n=un(fc({width:512,height:256,seed:t.seed,preset:t.texturePreset,bandCount:3,bandWarp:.02,stormCount:1})),s=new Le(t.radius,48,32),r=new it(s,new fe({map:n,roughness:.95,metalness:0}));e.add(r),this.spinners.push({node:e,speed:t.rotation}),this.moons[t.id]={def:t,group:e,mesh:r}}}_buildBelt(){const t=this.quality.asteroids,e=Vi(90210),n=new Tr(1,2),s=Cs(555),r=n.attributes.position,a=new T;for(let p=0;p<r.count;p++){a.fromBufferAttribute(r,p);const _=.72+Rs(s,a.x*1.6+3,a.y*1.6,a.z*1.6,4)*.62;a.multiplyScalar(_),r.setXYZ(p,a.x,a.y,a.z)}n.computeVertexNormals();const o=un(Dg(256,5150),{repeat:[2,2]}),l=new fe({map:o,roughness:.97,metalness:.06}),c=new C0(n,l,t);c.instanceMatrix.setUsage(Sr),c.frustumCulled=!1;const h=new Ce,u=new Ut,d=ue.rotationAxis;for(let p=0;p<t;p++){const g=e()*Math.PI*2,_=ue.majorRadius+(e()+e()-1)*ue.tubeRadius,f=(e()+e()-1)*ue.tubeRadius*.85,m=new T(Math.cos(g)*_,f,Math.sin(g)*_);m.applyAxisAngle(wa,0);const M=new rn().setFromUnitVectors(wa,d);m.applyQuaternion(M),m.add(ue.center);const x=ue.scaleMin+Math.pow(e(),2.1)*(ue.scaleMax-ue.scaleMin);h.position.copy(m),h.scale.setScalar(x),h.rotation.set(e()*Math.PI*2,e()*Math.PI*2,e()*Math.PI*2),h.updateMatrix(),c.setMatrixAt(p,h.matrix);const y=.4+e()*.55;u.setHSL(.08+e()*.06,.18+e()*.2,y*.6),c.setColorAt(p,u),this.asteroidInstances.push({position:m.clone(),radius:x*.85})}if(c.instanceMatrix.needsUpdate=!0,c.instanceColor&&(c.instanceColor.needsUpdate=!0),this.root.add(c),this.beltMesh=c,this.quality.dust){const g=new Float32Array(12600);for(let M=0;M<4200;M++){const x=e()*Math.PI*2,y=ue.majorRadius+(e()+e()-1)*ue.tubeRadius*1.1,L=(e()+e()-1)*ue.tubeRadius,R=new T(Math.cos(x)*y,L,Math.sin(x)*y);R.applyQuaternion(new rn().setFromUnitVectors(wa,d)),R.add(ue.center),g[M*3]=R.x,g[M*3+1]=R.y,g[M*3+2]=R.z}const _=new we;_.setAttribute("position",new Be(g,3));const f=new lh({color:12560778,size:1.1,sizeAttenuation:!1,transparent:!0,opacity:.55,depthWrite:!1,blending:Oe}),m=new jl(_,f);m.frustumCulled=!1,this.root.add(m),this.beltDust=m}this.beltBounds={center:ue.center.clone(),major:ue.majorRadius,tube:ue.tubeRadius}}_buildStation(){const t=new de;t.position.copy(kt.position),this.root.add(t);const e=un(Ho(512,77,[.34,.37,.42]),{repeat:[3,3],aniso:this.quality.anisotropy}),n=un(_h(256,21),{srgb:!1,repeat:[3,3]}),s=new fe({map:e,roughnessMap:n,roughness:.72,metalness:.55}),r=new fe({color:1777704,roughness:.6,metalness:.8}),a=new fe({color:14198076,roughness:.34,metalness:1,emissive:2759685,emissiveIntensity:.6}),o=new it(new qe(kt.coreRadius,kt.coreRadius,kt.coreRadius*5.2,20),s);o.rotation.z=Math.PI/2,t.add(o);const l=new it(new Le(kt.coreRadius,20,14),s);l.position.x=kt.coreRadius*2.6,t.add(l);const c=l.clone();c.position.x=-kt.coreRadius*2.6,t.add(c);const h=new de;h.rotation.x=Math.PI/2,t.add(h);const u=new it(new Kn(kt.ringRadius,3.1,12,64),s);h.add(u);for(let b=0;b<4;b++){const P=new de;P.rotation.x=b/4*Math.PI*2;const N=new it(new Pe(kt.coreRadius*.8,kt.ringRadius,kt.coreRadius*.55),s);N.position.y=kt.ringRadius/2+kt.coreRadius*.6,P.add(N),h.add(P)}this.spinners.push({node:h,speed:.09});for(const b of[-1,1]){const P=new de,N=new it(new Pe(26,.5,11),new fe({color:1450813,roughness:.28,metalness:.85,emissive:661552,emissiveIntensity:.5}));N.position.set(b*(kt.coreRadius*3.4+13),0,0),P.add(N);const v=new it(new qe(.5,.5,26,8),r);v.rotation.z=Math.PI/2,v.position.set(b*(kt.coreRadius*3.4+.5),0,0),P.add(v),t.add(P)}const d=new de;d.position.copy(kt.dockOffset),t.add(d);const p=new it(new qe(kt.dockRadius*.62,kt.dockRadius*.72,4.2,24,1,!0),r);p.position.y=2.1,d.add(p);const g=new it(new Kn(kt.dockRadius*.64,.7,10,28),a);g.rotation.x=Math.PI/2,g.position.y=4.1,d.add(g);const _=new Se({color:6287560,transparent:!0,opacity:.75,blending:Oe,depthWrite:!1,side:Fe}),f=new it(new Kn(kt.dockRadius*.95,.42,8,40),_);f.rotation.x=Math.PI/2,f.position.y=9,d.add(f),this.guideRing=f,this.guideMat=_;const m=new Se({color:3791028,transparent:!0,opacity:.08,blending:Oe,depthWrite:!1,side:Fe}),M=new it(new qe(kt.dockRadius*.7,kt.dockRadius*1.1,26,20,1,!0),m);M.position.y=14,d.add(M),this.dockBeam=M;const x=new Le(.5,8,6);for(let b=0;b<8;b++){const P=b/8*Math.PI*2,N=new it(x,new Se({color:9174982}));N.position.set(Math.cos(P)*kt.dockRadius*.66,3.6,Math.sin(P)*kt.dockRadius*.66),d.add(N)}const y=new it(new Fn(26,6.5),new Se({map:un(Lg("BEACON STATION",{sub:"BERTH 04 · ORBITAL RELAY"})),transparent:!0}));y.position.set(0,-kt.coreRadius*2.1,kt.coreRadius*1.02),t.add(y);const L=new Le(.42,8,6);for(let b=0;b<6;b++){const P=b/6*Math.PI*2,N=new it(L,new Se({color:b%2?16733542:5635993}));N.position.set(Math.cos(P)*kt.ringRadius,Math.sin(P*2)*1.4,Math.sin(P)*kt.ringRadius),t.add(N),this.blinkers.push({mesh:N,phase:b*.7,rate:1.4+b%3*.3})}const R=kt.position.clone().add(kt.dockOffset);this.station={def:kt,group:t,dock:d,portPosition:R,portNormal:new T(0,1,0),colliderRadius:kt.ringRadius+6,coreRadius:kt.coreRadius}}_buildDerelict(){const t=new de;t.position.copy(Me.position),t.rotation.set(.3,.8,.22),this.root.add(t);const e=new fe({color:4866616,roughness:.88,metalness:.55}),n=new it(new qe(Me.radius*.12,Me.radius*.12,Me.radius*4.4,8),e);n.rotation.z=Math.PI/2,t.add(n);for(let a=0;a<3;a++){const o=new it(new Le(Me.radius*.55,20,12,0,Math.PI*2,0,Math.PI/2.4),new fe({color:7037269,roughness:.7,metalness:.7,side:Fe}));o.position.set((a-1)*Me.radius*1.1,0,0),o.rotation.set(Math.PI*.62,0,.3*a),t.add(o)}const s=new fe({color:2760728,roughness:.4,metalness:.9,emissive:1051140,emissiveIntensity:.4});for(const a of[-1,1]){const o=new it(new Pe(Me.radius*1.7,.4,Me.radius*.8),s);o.position.set(0,a*Me.radius*.8,0),o.rotation.z=.2*a,t.add(o)}const r=new it(new Le(.7,10,8),new Se({color:16726586}));r.position.set(Me.radius*2,Me.radius*.5,0),t.add(r),this.blinkers.push({mesh:r,phase:0,rate:.55}),this.derelict={def:Me,group:t,colliderRadius:Me.radius}}_buildAnomalies(){this.anomalies={};const t=Vi(60613);for(const e of Vo){const n=new de;n.position.copy(e.position),n.rotation.set(t()*6,t()*6,t()*6),this.root.add(n);const s=new Tr(e.radius,2),r=Cs(e.seed||31),a=s.attributes.position,o=new T;for(let h=0;h<a.count;h++){o.fromBufferAttribute(a,h);const u=Rs(r,o.x*.16+5,o.y*.16,o.z*.16,4);o.multiplyScalar(.6+u*.9),a.setXYZ(h,o.x,o.y,o.z)}s.computeVertexNormals();const l=new it(s,new fe({color:7167822,roughness:.8,metalness:.35,emissive:1715258,emissiveIntensity:.55}));n.add(l);const c=Sa(un(pc(128,"rgba(120,240,255,1)","rgba(0,90,160,0)",1)),7336191,.55);c.scale.setScalar(e.radius*9),n.add(c),this.blinkers.push({mesh:c,phase:t()*6,rate:.9}),this.anomalies[e.id]={def:e,group:n,mesh:l,colliderRadius:e.radius*.9}}}update(t,e){this.elapsed+=t;const n=this.elapsed;this.sunDir.copy(Ae.position).sub(e).normalize();for(const s of this.spinners)s.node.rotation.y+=s.speed*t*60;for(const s of this.atmosphereGroups){const r=s.userData.uniforms;r.uSunDir.value.copy(this.sunDir),r.uCamPos.value.copy(e)}for(const s of this.ringMeshes){const r=s.userData.uniforms;if(r.uSunDir.value.copy(this.sunDir),r.uCamPos.value.copy(e),r.uPlanetCenter.value.lengthSq()===0){const a=new T;s.getWorldPosition(a),r.uPlanetCenter.value.copy(a)}}this.starSurface&&(this.starSurface.userData.uniforms.uTime.value=n,this.starSurface.userData.uniforms.uCamPos.value.copy(e)),this.starGlow&&(this.starGlow.userData.uniforms.uTime.value=n,this.starGlow.material.uniforms.uTime.value=n),this.starGlowOuter&&(this.starGlowOuter.material.uniforms.uTime.value=n*.6),this.starfieldMat&&(this.starfieldMat.uniforms.uTime.value=n),this.nebulaShell&&(this.nebulaShell.userData.uniforms.uTime.value=n);for(const s of this.blinkers){const r=Math.sin(n*s.rate*Math.PI*2+s.phase)>.2,a=s.mesh.material;a&&a.uniforms?a.uniforms.uIntensity.value=r?.55:.12:s.mesh.visible=r}if(this.guideRing){const s=.55+.45*Math.sin(n*2.2);this.guideMat.opacity=.35+s*.5,this.guideRing.scale.setScalar(.96+s*.08),this.dockBeam.material.opacity=.04+s*.07}}regionAt(t){let e=null,n=1/0;for(const s of vh){const r=t.distanceTo(s.center);r<n&&(n=r,e=s)}return{region:e,distance:n,inside:n<=e.radius}}}const Ea=new T,Zg=new T,_c=new rn;class Qg{constructor(t){this.settings=t,this.position=new T,this.velocity=new T,this.quaternion=new rn,this.angularVelocity=new T,this._mouseOmega=new T,this._keyOmega=new T,this.fuel=ae.fuelCapacity,this.hull=ae.hullMax,this.throttle=0,this.lateral=0,this.vertical=0,this.boosting=!1,this.braking=!1,this.burning=!1,this.heat=0,this.assist=!0,this.forward=new T(0,0,-1),this.right=new T(1,0,0),this.up=new T(0,1,0),this.distanceTravelled=0,this.reset()}reset(){this.position.copy(Ma.position),this.velocity.copy(Ma.velocity),this._lookAt(Ma.lookAt),this.angularVelocity.set(0,0,0),this._mouseOmega.set(0,0,0),this._keyOmega.set(0,0,0),this.throttle=0,this.lateral=0,this.vertical=0,this.boosting=!1,this.braking=!1,this.heat=0,this.fuel=ae.fuelCapacity,this.hull=ae.hullMax,this._syncBasis()}_lookAt(t){const e=Ea.copy(t).sub(this.position).normalize();this.quaternion.setFromUnitVectors(new T(0,0,-1),e)}_syncBasis(){this.forward.set(0,0,-1).applyQuaternion(this.quaternion),this.right.set(1,0,0).applyQuaternion(this.quaternion),this.up.set(0,1,0).applyQuaternion(this.quaternion)}get speed(){return this.velocity.length()}applyMouseDelta(t,e){const n=ae.mouseGain*(this.settings?this.settings.get("sensitivity"):1),r=(this.settings?this.settings.get("invertY"):!1)?1:-1;this._mouseOmega.x+=r*e*n,this._mouseOmega.y+=-t*n,this._mouseOmega.z+=0}step(t,e){const n=Math.exp(-5.4*t);this._keyOmega.set(0,0,0),e.keyPitchUp&&(this._keyOmega.x+=ae.keyRate),e.keyPitchDown&&(this._keyOmega.x-=ae.keyRate),e.keyYawLeft&&(this._keyOmega.y+=ae.keyRate),e.keyYawRight&&(this._keyOmega.y-=ae.keyRate),e.rollLeft&&(this._keyOmega.z+=ae.rollRate),e.rollRight&&(this._keyOmega.z-=ae.rollRate),this._mouseOmega.multiplyScalar(n),this.angularVelocity.copy(this._mouseOmega).add(this._keyOmega);const s=this.angularVelocity,r=.5*t;_c.set(s.x*r,s.y*r,s.z*r,1).normalize(),this.quaternion.multiply(_c).normalize(),this._syncBasis();let a=0,o=0,l=0;this.throttle=e.forward?1:e.back?-1:0,this.lateral=(e.right?1:0)-(e.left?1:0),this.vertical=(e.up?1:0)-(e.down?1:0);const c=e.boost&&this.fuel>0;this.boosting=!!c;const h=c?ae.boostMultiplier:1;if(e.forward&&(l-=ae.thrustAccel*h),e.back&&(l+=ae.thrustAccel*.75),e.right&&(a+=ae.lateralAccel*(c?1.8:1)),e.left&&(a-=ae.lateralAccel*(c?1.8:1)),e.up&&(o+=ae.verticalAccel*(c?1.8:1)),e.down&&(o-=ae.verticalAccel*(c?1.8:1)),Ea.set(a,o,l).applyQuaternion(this.quaternion),this.velocity.addScaledVector(Ea,t),this.braking=!!e.brake,this.braking&&this.velocity.length()>1e-4&&this.velocity.addScaledVector(Zg.copy(this.velocity).normalize(),-3.4*t),this.assist=this.settings?this.settings.get("flightAssist"):!0,this.assist){const g=!e.forward&&!e.back&&!e.left&&!e.right&&!e.up&&!e.down?ae.assistDamping:ae.assistDamping*.25;this.velocity.multiplyScalar(Math.exp(-g*t))}this.burning?(this.velocity.multiplyScalar(Math.exp(-.55*t)),this.heat=Math.min(1,this.heat+t*.55)):this.heat=Math.max(0,this.heat-t*.4);const u=this.velocity.length();u>ae.maxSpeed&&this.velocity.multiplyScalar(ae.maxSpeed/u),this.boosting&&(this.fuel=Math.max(0,this.fuel-ae.boostFuelPerSecond*t));const d=this.velocity.length()*t;this.position.addScaledVector(this.velocity,t),this.distanceTravelled+=d}applyCollision(t,e,n=0,s=.25){this.position.addScaledVector(t,e);const r=this.velocity.dot(t);r<0&&this.velocity.addScaledVector(t,-r*(1+s)),n>0&&(this.hull=Math.max(0,this.hull-n))}setPose(t,e){this.position.copy(t),this.quaternion.copy(e),this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this._mouseOmega.set(0,0,0),this._keyOmega.set(0,0,0),this._syncBasis()}}function xc(i,t,e,n){const s=-t/2,r=-e/2;return i.moveTo(s+n,r),i.lineTo(s+t-n,r),i.lineTo(s+t,r+n),i.lineTo(s+t,r+e-n),i.lineTo(s+t-n,r+e),i.lineTo(s+n,r+e),i.lineTo(s,r+e-n),i.lineTo(s,r+n),i.closePath(),i}function hr(i,t,e,n,s,r,a=.3){const o=xc(new Es,i,t,e);o.holes.push(xc(new go,n,s,r));const l=new $i(o,{depth:a,bevelEnabled:!0,bevelThickness:.04,bevelSize:.04,bevelSegments:1,curveSegments:1});return l.center(),l}function dn(i,t,e,n=.35){const s=new Es;s.moveTo(-i/2,-t/2),s.lineTo(i/2,-t/2),s.lineTo(i/2-n,t/2),s.lineTo(-i/2+n,t/2),s.closePath();const r=new $i(s,{depth:e,bevelEnabled:!1,curveSegments:1});return r.translate(0,0,-e/2),r}function tv({mfdTexture:i,gaugeTexture:t,quality:e}){const n=new de;n.name="cockpit";const s=Cr(Ho(512,411,[.42,.39,.33]),{repeat:[4,4],aniso:e.anisotropy}),r=Cr(_h(256,88),{srgb:!1,repeat:[2,2]}),a=new fe({map:s,roughnessMap:r,roughness:.58,metalness:.55,color:12432548}),o=new fe({map:s,roughnessMap:r,roughness:.74,metalness:.38,color:9866365}),l=new fe({color:2827548,roughness:.45,metalness:.78}),c=new fe({color:1841427,roughness:.96,metalness:.04}),h=new fe({color:1117448,roughness:.28,metalness:.9,emissive:3810312,emissiveIntensity:1}),u=new fe({color:12159540,roughness:.3,metalness:1,emissive:2759686,emissiveIntensity:.8}),d=new it(hr(4.05,2.05,.52,3.32,1.34,.4,.32),a);d.position.set(0,.3,-1.95),d.rotation.x=.025,n.add(d);const p=new it(hr(3.46,1.46,.44,3.32,1.34,.4,.34),l);p.position.set(0,.3,-1.86),n.add(p);const g=new it(new Pe(.075,1.38,.3),l);g.position.set(0,.3,-1.8),n.add(g);const _=new it(new Pe(.11,.16,.34),u);_.position.set(0,.3,-1.8),n.add(_);const f=new it(dn(3.95,.44,.72,.5),o);f.position.set(0,1.14,-1.72),f.rotation.x=-.22,n.add(f);const m=new it(dn(3.55,.16,.3,.42),h);m.position.set(0,.93,-1.62),m.rotation.x=-.22,n.add(m);const M=new qe(.028,.028,.03,6);for(let ct=0;ct<16;ct++){const mt=new it(M,u);mt.position.set(-1.78+ct*.237,.97,-1.41),mt.rotation.x=Math.PI/2-.22,n.add(mt)}for(const ct of[-1,1]){const mt=new it(hr(1.72,1.62,.4,1.3,1.16,.3,.26),a);mt.position.set(ct*2.08,.24,-1.2),mt.rotation.y=ct*1.02,mt.rotation.z=ct*.04,n.add(mt);const $=new it(dn(.3,.3,2.2,.1),o);$.position.set(ct*2.02,.3,.3),$.rotation.y=ct*.3,n.add($)}const x=new it(dn(.32,.24,2.1,.08),o);x.position.set(0,1.06,.22),n.add(x);const y=new de;y.position.set(0,-.44,-1.02),y.rotation.x=-.5,n.add(y);const L=new it(dn(2.75,.92,.16,.26),o);y.add(L);const R=new it(dn(2.9,.13,.22,.3),l);R.position.y=.5,y.add(R);const b=new it(hr(.86,.66,.11,.7,.52,.08,.12),l);b.position.set(-.58,.12,.12),y.add(b);const P=new Se({map:i,toneMapped:!1}),N=new it(new Fn(.68,.5),P);N.position.set(-.58,.12,.135),y.add(N);const v=new it(new Fn(.8,.6),new Se({color:16751164,transparent:!0,opacity:.16,blending:Oe,depthWrite:!1}));v.position.set(-.58,.12,.128),y.add(v);const w=new it(new qe(.212,.238,.18,28,1,!0),o.clone());w.material.side=Fe,w.rotation.x=Math.PI/2,w.position.set(.6,.14,.03),y.add(w);const O=new it(new Kn(.2,.026,10,30),u);O.position.set(.6,.14,.125),y.add(O);const B=new Se({map:t,toneMapped:!1}),k=new it(new vs(.188,32),B);k.position.set(.6,.14,.118),y.add(k);const X=new it(new Le(.215,24,12,0,Math.PI*2,0,Math.PI*.34),new Se({color:12571880,transparent:!0,opacity:.07,depthWrite:!1,side:Fe,blending:Oe}));X.rotation.x=-Math.PI/2,X.position.set(.6,.14,.1),y.add(X);const z=[];for(let ct=0;ct<3;ct++){const mt=new it(new Kn(.062,.014,8,18),u);mt.position.set(.02+ct*.15,.34,.1),y.add(mt);const $=new it(new vs(.055,18),new Se({color:2759692}));$.position.set(.02+ct*.15,.34,.092),y.add($),z.push(mt)}const j=[16761968,7327639,14833468,15313213];for(let ct=0;ct<4;ct++){const mt=new it(new vs(.032,12),new Se({color:j[ct]}));mt.position.set(-.14+ct%2*.09,-.26-Math.floor(ct/2)*.1,.092),y.add(mt)}const H=[];for(const ct of[-1,1]){const mt=new de;mt.position.set(ct*1.16,-.56,-.74),mt.rotation.y=ct*.44,mt.rotation.x=-.4,n.add(mt);const $=new it(dn(.56,.18,1.3,.1),o);mt.add($);for(let tt=0;tt<6;tt++){const lt=new it(new Pe(.11,.035,.11),new fe({color:1906963,emissive:j[tt%j.length],emissiveIntensity:.8,roughness:.35,metalness:.35}));lt.position.set(0,.1,-.46+tt*.185),mt.add(lt),H.push(lt)}const C=new it(new qe(.07,.09,.09,10),l);C.position.set(ct*.06,.13,.4),mt.add(C);const ot=new it(new qe(.026,.034,.3,8),c);ot.position.set(ct*.06,.29,.4),ot.rotation.z=ct*.14,mt.add(ot);const rt=new it(new Pe(.1,.14,.08),c);rt.position.set(ct*.06,.46,.4),rt.rotation.z=ct*.14,mt.add(rt)}const at=new de;at.position.set(0,.92,-.86),at.rotation.x=.78,n.add(at);const ft=new it(dn(1.6,.14,.64,.14),o);at.add(ft);for(let ct=0;ct<8;ct++){const mt=new it(new Pe(.055,.055,.14),new fe({color:2893341,roughness:.45,metalness:.65}));mt.position.set(-.6+ct%4*.4,.08,-.14+Math.floor(ct/4)*.27),at.add(mt)}const pt=new it(new Pe(3,.1,2.6),c);pt.position.set(0,-1.34,.12),n.add(pt);const Vt=new it(dn(1.7,.44,.95,.22),o);Vt.position.set(0,-1.04,.44),n.add(Vt);const Wt=new Se({color:13077306});for(const ct of[-1,1]){const mt=new it(new Pe(.022,.022,1.95),Wt);mt.position.set(ct*1.72,-.42,-.2),n.add(mt)}const q=new it(new Pe(1.95,.016,.016),Wt);q.position.set(0,-.26,-.96),n.add(q);const et=$g(15313213,.4);et.position.set(0,.16,-1.52),et.scale.setScalar(.58),n.add(et);const St=new it(new qe(.045,.065,.03,10),new Se({color:15250524}));St.position.set(0,.03,-1.12),n.add(St);const ht=new _r(16763274,3.4,9,2);ht.position.set(0,.62,-1.05),n.add(ht);const It=new _r(16751181,1.6,6,2);It.position.set(0,-.46,-.78),n.add(It);const Dt=new _r(16769208,1.1,7,2);return Dt.position.set(0,.05,-.45),n.add(Dt),{group:n,mfd:{screen:N,screenMat:P},gauge:{crtScreen:k,gaugeMat:B,glass:X},hologram:et,sideButtons:H,telltale:z,cabinLight:ht}}function yc({quality:i}){const t=new de;t.name="exterior-ship";const e=Cr(Ho(512,912,[.34,.31,.26]),{repeat:[4,4],aniso:i.anisotropy}),n=new fe({map:e,roughness:.42,metalness:.85,color:14077890}),s=new fe({color:1446927,roughness:.42,metalness:.88}),r=new fe({color:12159540,roughness:.28,metalness:1}),a=new fe({color:1709064,roughness:.1,metalness:.6,emissive:3811852,emissiveIntensity:.8}),o=new Es;o.moveTo(0,2.55),o.lineTo(.42,1.35),o.lineTo(.62,-.35),o.lineTo(.4,-1.55),o.lineTo(-.4,-1.55),o.lineTo(-.62,-.35),o.lineTo(-.42,1.35),o.closePath();const l=new $i(o,{depth:.42,bevelEnabled:!0,bevelThickness:.13,bevelSize:.13,bevelSegments:2,curveSegments:1});l.rotateX(-Math.PI/2),l.translate(0,0,0);const c=new it(l,n);c.scale.set(1.35,1,1),t.add(c);for(const _ of[-1,1]){const f=new Es;f.moveTo(0,.75),f.lineTo(2.15,-.55),f.lineTo(2.25,-1.05),f.lineTo(.15,-.95),f.closePath();const m=new $i(f,{depth:.12,bevelEnabled:!0,bevelThickness:.04,bevelSize:.04,bevelSegments:1,curveSegments:1});m.rotateX(-Math.PI/2);const M=new it(m,n);M.scale.x=_,M.position.set(_*.42,-.04,.28),M.rotation.z=_*.1,t.add(M);const x=new it(new Pe(.16,.52,.72),s);x.position.set(_*2.28,.2,-.2),t.add(x);const y=new it(new qe(.26,.3,1.35,18),s);y.rotation.x=Math.PI/2,y.rotation.z=_*.16,y.position.set(_*.92,-.14,-.55),t.add(y);const L=new it(new Kn(.27,.038,8,20),r);L.position.set(_*.92,-.14,-1.18),t.add(L);const R=Jg(2.8,.26,16769192,13658654);R.rotation.x=Math.PI/2,R.position.set(_*.92,-.14,-1.32-1.4),t.add(R),t.userData.plumes=t.userData.plumes||[],t.userData.plumes.push(R)}const h=new it(dn(.34,.46,2.2,.12),n);h.rotation.x=Math.PI/2,h.position.set(0,.4,-.35),t.add(h);const u=new it(dn(.1,.95,.85,.22),n);u.rotation.x=Math.PI/2,u.position.set(0,.72,-1.2),t.add(u);const d=new it(new Le(.4,20,14,0,Math.PI*2,0,Math.PI/2),a);d.scale.set(1,.72,1.9),d.position.set(0,.24,1),t.add(d);const p=new it(new Dr(.13,1,8),r);p.rotation.x=-Math.PI/2,p.position.set(0,0,2.75),t.add(p);const g=[];for(const[_,f]of[[new T(-2.3,.2,-.2),16731486],[new T(2.3,.2,-.2),5111706],[new T(0,1.12,-1.2),16773328]]){const m=new it(new Le(.07,8,6),new Se({color:f}));m.position.copy(_),t.add(m),g.push(m)}return{group:t,plumes:t.userData.plumes||[],navLights:g,hullMat:n}}const yo={"menu.start":"接管霜隙号","menu.help":"操作说明","menu.settings":"设置","menu.journal":"远航档案","menu.skip":"跳到驾驶舱","menu.scene":"驾驶舱视图","hud.logTitle":"远航日志","menu.note":"进入后点击画面锁定鼠标；若浏览器拒绝锁定，将自动切换为拖拽 / 方向键操控。","menu.lore":"灯塔站的补给只够走完七段航程。<br />你的任务是把这艘单人穿梭艇——<b>霜隙号 FG-1</b>——开过这片空隙，并把沿途每一个天体都登记进远航档案。","pause.title":"航行暂停","pause.resume":"继续航行","pause.help":"操作说明","pause.reset":"重置飞船","pause.quit":"返回主菜单","set.quality":"画质","set.volume":"音量","set.sensitivity":"鼠标灵敏度","set.fov":"视场角 FOV","set.invertY":"反转 Y 轴","set.assist":"飞行辅助（松杆自动减速）","set.mute":"静音","set.quality.low":"低","set.quality.medium":"中","set.quality.high":"高","starmap.title":"星图","starmap.jump":"执行跃迁","starmap.close":"关闭","starmap.region":"所属区域","starmap.coords":"坐标","help.title":"操作说明","help.note":"飞船遵循牛顿惯性：推进只加速，松杆不会自动停住。","help.close":"返回","journal.title":"远航档案","journal.close":"返回","journal.unlogged":"未登记目标","scan.close":"关闭","scan.kind.star":"恒星","scan.kind.planet":"行星","scan.kind.moon":"卫星","scan.kind.anomaly":"异常体","scan.kind.station":"空间站","scan.kind.derelict":"废弃结构","load.init":"正在初始化","menu.tag":"可玩 · 6DOF","footer.hint":"键盘操作 · Esc 暂停 · M 星图 · F 扫描 · R 对接","footer.credit":"全部素材程序化生成 · 零外部请求 · 自托管字体","load.hint":"全部素材由程序实时生成 · 无外部网络请求","pointer.title":"点击画面","pointer.desc":"锁定鼠标以驾驶","hud.shipName":"霜隙号","hud.nearest":"最近目标","hud.dockDist":"泊位距离","hud.discovery":"已归档","hud.heading":"航向","hud.camMode":"驾驶模式","hud.throttle":"推进","hud.fuel":"燃料","hud.hull":"船体","hud.scan":"扫描","hud.cam.cockpit":"座舱","hud.cam.chase":"追尾","hud.boost.idle":"后燃器待机","hud.boost.on":"后燃器点火","hud.key.thrust":"推进","hud.key.lift":"升降","hud.key.roll":"滚转","hud.key.boost":"后燃","hud.key.brake":"刹停","hud.key.scan":"扫描","hud.key.dock":"对接","hud.key.starmap":"星图","hud.key.view":"视角","hud.key.help":"帮助","tutorial.0":"W / S 前后推进 · A / D 平移","tutorial.1":"Space / Ctrl 升降 · Q / E 滚转","tutorial.2":"鼠标控制俯仰与偏航","tutorial.3":"Shift 后燃器推进 · X 刹停","tutorial.4":"F 扫描天体 · M 打开星图","tutorial.5":"R 在灯塔站对接","help.row.mouse":"俯仰 / 偏航（锁定指针后直接操控）","help.row.drag":"未锁定指针时的转向备用方式","help.row.ws":"向前 / 向后推进","help.row.ad":"向左 / 向右平移","help.row.lift":"上升 / 下降","help.row.roll":"向左 / 向右滚转","help.row.arrow":"俯仰 / 偏航（纯键盘操控）","help.row.shift":"后燃器推进（消耗燃料）","help.row.brake":"刹停（反推抵消速度）","help.row.f":"扫描天体并归档","help.row.r":"与灯塔站对接 / 脱离","help.row.m":"打开星图并跃迁","help.row.tab":"在菜单与面板之间移动焦点（不劫持）","help.row.v":"座舱 / 追尾视角切换","help.row.h":"打开本说明","help.row.esc":"暂停 / 解除鼠标锁定","help.row.backspace":"重置飞船姿态与位置","toast.lockHint":"点击画面锁定鼠标；若锁定失败，可用拖拽或方向键操控","toast.reset":"霜隙号已重置到泊位","toast.camCockpit":"座舱视角","toast.camChase":"追尾视角","toast.undock":"已脱离泊位","toast.dockTooFar":"距离泊位过远，无法对接","toast.dockTooFast":"速度过高（{speed} m/s），按 X 刹车","toast.dockDone":"对接完成 · 燃料加满 · 船体修复","toast.noScanTarget":"扫描范围内没有可扫描的目标","toast.scanStart":"开始扫描：{name}","toast.scanLost":"目标已超出扫描范围，中断扫描","toast.newRecord":"新登记：{name}","toast.archived":"{name} 的资料已归档","toast.routeLocked":"跃迁航线已锁定：{name}","toast.warpDone":"跃迁完成：{name}","toast.hullLost":"船体损毁 · 紧急拖回灯塔站（-150 信用点）","toast.quality":"画质已切换","toast.scanRunning":"扫描进行中","toast.scanTarget":"扫描 {name}","hud.unknown":"未知空域","hud.berth":"泊位","help.key.mouse":"鼠标移动","help.key.drag":"鼠标拖拽","help.key.arrow":"方向键","journal.needScan":"需要扫描","journal.needScanDesc":"靠近并使用扫描仪（F）以取得该目标的详细数据。","journal.summary":"航程小结","journal.stat":"已登记 {logged} / {total} 个目标 · 完成 {missions} 项任务 · 跃迁 {jumps} 次 · 对接 {docks} 次 · 累计航行 {distance} km · 信用点 {credits}","scan.stat.radius":"半径","scan.stat.distance":"距船","scan.stat.kind":"类型","scan.stat.time":"扫描时间","warn.atmosphere":"进入{name}大气层 · 过热警告","warn.impact":"撞击{name}地表 · 船体受损","warn.approach":"接近{name}地表","prompt.warp":"跃迁进行中","prompt.undock":"按 R 脱离泊位，开始这段航程","prompt.dock":"按 R 与灯塔站对接","prompt.slowDown":"减速到 {limit} m/s 以下才能对接（当前 {speed} m/s）","warn.stationStructure":"撞击空间站结构","warn.stationRing":"撞击空间站旋转环","warn.kalsoArray":"撞击开普勒阵列","warn.unknownStructure":"撞击未知结构","warn.asteroid":"撞击小行星","warn.lowFuel":"燃料不足 · 返回灯塔站补给","warn.overheat":"船体过热 · 离开大气层","warn.warpCharging":"跃迁充能中","mfd.lowFuel":"燃料不足","load.generating":"正在生成天体系统","load.rebuilding":"正在重建天体系统…","marker.star":"索尔·普莱姆"},ev={"menu.start":"Take the helm of FG-1","menu.help":"Controls","menu.settings":"Settings","menu.journal":"Voyage log","menu.skip":"Skip to the cockpit","menu.scene":"Cockpit view","hud.logTitle":"Voyage log","menu.note":"Click the view to lock the pointer. If the browser refuses, steering falls back to drag or arrow keys.","menu.lore":"Lighthouse Station can fuel seven legs of this voyage.<br />Your job is to fly the single-seat shuttle — <b>Frostgap FG-1</b> — across the gap, and log every body you meet in the voyage record.","pause.title":"Flight paused","pause.resume":"Resume flight","pause.help":"Controls","pause.reset":"Reset ship","pause.quit":"Back to main menu","set.quality":"Graphics quality","set.volume":"Volume","set.sensitivity":"Mouse sensitivity","set.fov":"Field of view","set.invertY":"Invert Y axis","set.assist":"Flight assist (auto-damp when idle)","set.mute":"Mute","set.quality.low":"Low","set.quality.medium":"Medium","set.quality.high":"High","starmap.title":"Stellar chart","starmap.jump":"Execute jump","starmap.close":"Close","starmap.region":"Region","starmap.coords":"Coordinates","help.title":"Controls","help.note":"The ship follows Newtonian inertia: thrust only accelerates, and releasing the stick does not stop you.","help.close":"Back","journal.title":"Voyage log","journal.close":"Back","journal.unlogged":"Unlogged body","scan.close":"Close","scan.kind.star":"Star","scan.kind.planet":"Planet","scan.kind.moon":"Moon","scan.kind.anomaly":"Anomaly","scan.kind.station":"Station","scan.kind.derelict":"Derelict","load.init":"Initialising","menu.tag":"Playable · 6DOF","footer.hint":"Keyboard · Esc pause · M star map · F scan · R dock","footer.credit":"Everything generated at runtime · no external requests · self-hosted fonts","load.hint":"Every asset is generated at runtime · no network requests","pointer.title":"Click the view","pointer.desc":"Lock the pointer to fly","hud.shipName":"FG-1","hud.nearest":"Nearest target","hud.dockDist":"Berth range","hud.discovery":"Logged","hud.heading":"Heading","hud.camMode":"View mode","hud.throttle":"Thrust","hud.fuel":"Fuel","hud.hull":"Hull","hud.scan":"Scan","hud.cam.cockpit":"Cockpit","hud.cam.chase":"Chase","hud.boost.idle":"Burner standby","hud.boost.on":"Burner lit","hud.key.thrust":"Thrust","hud.key.lift":"Lift","hud.key.roll":"Roll","hud.key.boost":"Burner","hud.key.brake":"Brake","hud.key.scan":"Scan","hud.key.dock":"Dock","hud.key.starmap":"Chart","hud.key.view":"View","hud.key.help":"Help","tutorial.0":"W / S thrust · A / D strafe","tutorial.1":"Space / Ctrl lift · Q / E roll","tutorial.2":"Mouse pitches and yaws","tutorial.3":"Shift burner · X brake","tutorial.4":"F scan a body · M open the chart","tutorial.5":"R docks at Lighthouse Station","help.row.mouse":"Pitch / yaw (direct control once the pointer is locked)","help.row.drag":"Fallback steering by dragging when the pointer is free","help.row.ws":"Thrust forward / back","help.row.ad":"Strafe left / right","help.row.lift":"Ascend / descend","help.row.roll":"Roll left / right","help.row.arrow":"Pitch / yaw (keyboard only)","help.row.shift":"Afterburner thrust (burns fuel)","help.row.brake":"Brake (retro-thrust to cancel speed)","help.row.f":"Scan a body and file it","help.row.r":"Dock / undock at Lighthouse Station","help.row.m":"Open the chart and jump","help.row.tab":"Move focus between menus and panels (never hijacked)","help.row.v":"Toggle cockpit / chase view","help.row.h":"Open this panel","help.row.esc":"Pause / release the pointer","help.row.backspace":"Reset ship attitude and position","toast.lockHint":"Click the view to lock the pointer; if it fails, use drag or arrow keys","toast.reset":"FG-1 reset to the berth","toast.camCockpit":"Cockpit view","toast.camChase":"Chase view","toast.undock":"Undocked","toast.dockTooFar":"Berth is out of range","toast.dockTooFast":"Too fast ({speed} m/s) — press X to brake","toast.dockDone":"Docked · refuelled · hull repaired","toast.noScanTarget":"No scannable body in range","toast.scanStart":"Scanning: {name}","toast.scanLost":"Target left scan range — scan aborted","toast.newRecord":"New entry: {name}","toast.archived":"{name} filed in the voyage record","toast.routeLocked":"Jump route locked: {name}","toast.warpDone":"Jump complete: {name}","toast.hullLost":"Hull destroyed · emergency tow to Lighthouse Station (−150 credits)","toast.quality":"Graphics quality switched","toast.scanRunning":"Scan in progress","toast.scanTarget":"Scanning {name}","hud.unknown":"Unknown airspace","hud.berth":"Berth","help.key.mouse":"Mouse move","help.key.drag":"Mouse drag","help.key.arrow":"Arrow keys","journal.needScan":"Scan required","journal.needScanDesc":"Close in and use the scanner (F) to pull detailed data on this body.","journal.summary":"Voyage summary","journal.stat":"{logged} / {total} bodies logged · {missions} missions completed · {jumps} jumps · {docks} dockings · {distance} km flown · {credits} credits","scan.stat.radius":"Radius","scan.stat.distance":"Range","scan.stat.kind":"Type","scan.stat.time":"Scanned at","warn.atmosphere":"Entering the {name} atmosphere · overheat warning","warn.impact":"Impact with the {name} surface · hull damage","warn.approach":"Approaching the {name} surface","prompt.warp":"Jump in progress","prompt.undock":"Press R to leave the berth and begin the voyage","prompt.dock":"Press R to dock with Lighthouse Station","prompt.slowDown":"Slow below {limit} m/s to dock (currently {speed} m/s)","warn.stationStructure":"Collision with the station structure","warn.stationRing":"Collision with the station’s rotating ring","warn.kalsoArray":"Collision with the Kalso Array","warn.unknownStructure":"Collision with an unknown structure","warn.asteroid":"Asteroid impact","warn.lowFuel":"Low fuel · return to Lighthouse Station for refuelling","warn.overheat":"Hull overheating · leave the atmosphere","warn.warpCharging":"Jump charging","mfd.lowFuel":"LOW FUEL","load.generating":"Generating the star system","load.rebuilding":"Rebuilding the star system…","marker.star":"Sol Prime"},nv={zh:yo,en:ev},xh="frostgap-voyager.lang.v1",iv=["zh","en"];let Ps="zh";const Mo=new Set;function ps(){return Ps}function _t(i,t){let n=(nv[Ps]||yo)[i];return n===void 0&&(n=yo[i]),n===void 0?i:(t&&(n=n.replace(/\{(\w+)\}/g,(s,r)=>t[r]!==void 0?String(t[r]):s)),n)}function te(i,t){if(!i)return"";if(Ps==="en"){const e=i[`${t}En`];if(e)return e}return i[t]??""}function yh(i){return Mo.add(i),()=>Mo.delete(i)}function sv(i=document){!i||!i.querySelectorAll||(i.querySelectorAll("[data-i18n]").forEach(t=>{t.textContent=_t(t.dataset.i18n)}),i.querySelectorAll("[data-i18n-html]").forEach(t=>{t.innerHTML=_t(t.dataset.i18nHtml)}),i.querySelectorAll("[data-i18n-aria]").forEach(t=>{t.setAttribute("aria-label",_t(t.dataset.i18nAria))}),i.querySelectorAll("[data-i18n-title]").forEach(t=>{t.setAttribute("title",_t(t.dataset.i18nTitle))}))}function rv(){try{const i=new URLSearchParams(window.location.search).get("lang");if(!i)return null;const t=i.toLowerCase();if(t==="en"||t==="en-us"||t==="en-gb")return"en";if(t.startsWith("zh"))return"zh"}catch{}return null}function av(){if(typeof document>"u"||!document.head)return;const i=`${window.location.origin}${window.location.pathname}`,t=[{hreflang:"zh-CN",href:`${i}?lang=zh-CN`},{hreflang:"en",href:`${i}?lang=en`},{hreflang:"x-default",href:`${i}?lang=zh-CN`}];document.head.querySelectorAll('link[rel="alternate"][data-ds-hreflang]').forEach(e=>e.remove()),t.forEach(({hreflang:e,href:n})=>{const s=document.createElement("link");s.rel="alternate",s.hreflang=e,s.href=n,s.setAttribute("data-ds-hreflang",""),document.head.appendChild(s)})}function Mh(i){const t=iv.includes(i)?i:"zh";Ps=t,document.documentElement.lang=t==="zh"?"zh-CN":"en";try{localStorage.setItem(xh,t)}catch{}av(),sv(document),Mo.forEach(e=>{try{e(t)}catch(n){console.warn("[i18n] 语言刷新回调失败",n)}})}function ov(){let i=null;try{i=localStorage.getItem(xh)}catch{i=null}const t=rv();return Mh(t||(i==="en"?"en":"zh")),Ps}const Xt=i=>document.getElementById(i);class lv{constructor(){this.root=Xt("hud"),this.el={regionName:Xt("regionName"),regionCoords:Xt("regionCoords"),missionTitle:Xt("missionTitle"),missionDesc:Xt("missionDesc"),missionHint:Xt("missionHint"),missionBar:Xt("missionBar"),missionStep:Xt("missionStep"),throttleBar:Xt("throttleBar"),throttleValue:Xt("throttleValue"),fuelBar:Xt("fuelBar"),fuelValue:Xt("fuelValue"),hullBar:Xt("hullBar"),hullValue:Xt("hullValue"),scanBar:Xt("scanBar"),scanValue:Xt("scanValue"),speedValue:Xt("speedValue"),speedBar:Xt("speedBar"),boostValue:Xt("boostValue"),dockDist:Xt("dockDist"),nearest:Xt("nearest"),discoveryCount:Xt("discoveryCount"),headingValue:Xt("headingValue"),camMode:Xt("camMode"),prompt:Xt("prompt"),promptKey:Xt("promptKey"),promptText:Xt("promptText"),scanPanel:Xt("scanPanel"),scanProgress:Xt("scanProgress"),scanTarget:Xt("scanTarget"),warning:Xt("warning"),markers:Xt("markers"),toast:Xt("toast"),vignette:Xt("vignette"),flash:Xt("flash"),pointerHint:Xt("pointerHint")},this._markerMap=new Map,this._warningText=""}show(){this.root.classList.remove("hidden")}hide(){this.root.classList.add("hidden")}setRegion(t,e){this.el.regionName.textContent=t,this.el.regionCoords.textContent=e}setMission(t,e,n,s,r,a=""){this.el.missionTitle.textContent=t,this.el.missionDesc.textContent=e,this.el.missionBar.style.width=`${Math.max(0,Math.min(1,n))*100}%`,this.el.missionStep.textContent=`${s}/${r}`,this.el.missionHint.textContent=a}setFlight({speedMs:t,throttle:e,boosting:n,fuel:s,hull:r,maxSpeed:a}){this.el.speedValue.textContent=Math.round(t).toLocaleString("en-US"),this.el.speedBar.style.width=`${Math.min(100,t/a*100)}%`,this.el.throttleBar.style.width=`${Math.max(0,Math.min(1,e))*100}%`,this.el.throttleValue.textContent=`${Math.round(e*100)}%`,this.el.fuelBar.style.width=`${Math.max(0,Math.min(100,s))}%`,this.el.fuelValue.textContent=`${Math.round(s)}`,this.el.fuelValue.style.color=s<25?"var(--play-ember)":"",this.el.hullBar.style.width=`${Math.max(0,Math.min(100,r))}%`,this.el.hullValue.textContent=`${Math.round(r)}`,this.el.hullValue.style.color=r<35?"var(--play-ember)":"",this.el.boostValue.textContent=_t(n?"hud.boost.on":"hud.boost.idle"),this.el.boostValue.classList.toggle("on",!!n)}setSystems({scan:t,dockDist:e,nearest:n,discoveries:s,total:r,heading:a,camMode:o}){this.el.scanBar.style.width=`${Math.max(0,Math.min(1,t))*100}%`,this.el.scanValue.textContent=t>0?`${Math.round(t*100)}%`:"—",this.el.dockDist.textContent=e!=null?`${(e/10).toFixed(1)} km`:"—",this.el.nearest.textContent=n||"—",this.el.discoveryCount.textContent=`${s} / ${r}`,this.el.headingValue.textContent=`${String(Math.round(a)).padStart(3,"0")}°`,this.el.camMode.textContent=_t(o==="chase"?"hud.cam.chase":"hud.cam.cockpit")}setPrompt(t,e){if(!e){this.el.prompt.classList.add("hidden");return}this.el.prompt.classList.remove("hidden"),this.el.promptKey.textContent=t,this.el.promptText.textContent=e}setScan(t,e,n){if(!t){this.el.scanPanel.classList.add("hidden");return}this.el.scanPanel.classList.remove("hidden"),this.el.scanProgress.style.width=`${Math.max(0,Math.min(1,e))*100}%`,this.el.scanTarget.textContent=n||"—"}setWarning(t){t!==this._warningText&&(this._warningText=t,t?(this.el.warning.classList.remove("hidden"),this.el.warning.textContent=t):this.el.warning.classList.add("hidden"))}setDanger(t){this.el.vignette.classList.toggle("on",t>.02),this.el.vignette.style.opacity=String(Math.min(1,t))}flash(t=.5,e=.3){const n=this.el.flash;n.style.transition="none",n.style.opacity=String(t),requestAnimationFrame(()=>{n.style.transition=`opacity ${e}s ease-out`,n.style.opacity="0"})}setPointerHint(t){this.el.pointerHint.classList.toggle("hidden",!t)}syncMarkers(t){const e=new Set;for(const n of t){e.add(n.id);let s=this._markerMap.get(n.id);s||(s=document.createElement("div"),s.className="marker",s.innerHTML='<div class="diamond"></div><div class="label"></div><div class="dist"></div>',this.el.markers.appendChild(s),this._markerMap.set(n.id,s)),s.className=`marker ${n.cls||""}`,s.style.left=`${n.x}px`,s.style.top=`${n.y}px`,s.style.display=n.visible?"":"none";const r=s.querySelector(".label"),a=s.querySelector(".dist");r.textContent!==n.label&&(r.textContent=n.label);const o=n.dist!=null?`${(n.dist/10).toFixed(1)} km`:"";a.textContent!==o&&(a.textContent=o)}for(const[n,s]of this._markerMap)e.has(n)||(s.remove(),this._markerMap.delete(n))}toast(t,e=""){const n=document.createElement("div");n.className=`toast-item ${e}`,n.textContent=t,this.el.toast.appendChild(n),setTimeout(()=>n.remove(),3600)}}const ye=i=>document.getElementById(i),Ui=[{id:"velan-orbit",name:"维岚轨道",nameEn:"Velan Orbit",subtitle:"气态巨行星 · 灯塔站",subtitleEn:"Gas giant · Beacon Station",region:"velan-orbit",position:new T(620,545,640),info:"维岚与灯塔站所在的轨道带。补给点，也是这段航程的起点。",infoEn:"The orbital band of Velan and Beacon Station — the resupply point and the start of this course."},{id:"debris-gallery",name:"碎屑回廊",nameEn:"Debris Gallery",subtitle:"岩屑密集区 · 三处异常",subtitleEn:"Dense rock · three anomalies",region:"debris-gallery",position:ue.center.clone().add(new T(40,330,250)),info:"岩屑带的中心环。三处未登记异常体信号都记录在这个区域。",infoEn:"The central ring of the rock belt. Signals from all three unlogged anomalies are recorded here."},{id:"frostgap-system",name:"霜隙环系",nameEn:"Frostgap System",subtitle:"冰巨星 · 环带",subtitleEn:"Ice giant · ring system",region:"frostgap-system",position:Ge[1].position.clone().add(new T(120,160,1320)),info:"冰巨星霜隙与它的冰晶环系，卫星莫恩位于外侧轨道。",infoEn:"Ice giant Frostgap and its crystalline rings; moon Morn rides the outer orbit."},{id:"irda",name:"伊尔达",nameEn:"Irda",subtitle:"G2V 主序星",subtitleEn:"G2V main-sequence star",region:"irda",position:Ae.position.clone().add(new T(0,120,Ae.radius*3.4)),info:"这片空隙里唯一的光源。靠近时辐射水平急升，注意船体温度。",infoEn:"The only light source in this gap. Radiation climbs fast on approach — watch hull temperature."},{id:"kalso-array",name:"卡尔索阵列",nameEn:"Kalso Array",subtitle:"废弃中继站",subtitleEn:"Abandoned relay",region:"debris-gallery",position:Me.position.clone().add(new T(0,150,190)),info:"一座被遗弃的中继阵列，正好落在碎屑回廊的几何中心。",infoEn:"An abandoned relay array sitting exactly at the geometric centre of the Debris Gallery."}],cv=[["help.key.mouse","help.row.mouse"],["help.key.drag","help.row.drag"],["W / S","help.row.ws"],["A / D","help.row.ad"],["Space / Ctrl","help.row.lift"],["Q / E","help.row.roll"],["help.key.arrow","help.row.arrow"],["Shift","help.row.shift"],["X / B","help.row.brake"],["F","help.row.f"],["R","help.row.r"],["M","help.row.m"],["Tab","help.row.tab"],["V","help.row.v"],["H","help.row.h"],["Esc","help.row.esc"],["Backspace","help.row.backspace"]];class hv{constructor(t,e){this.bus=t,this.save=e,this.selected=Ui[0],this.active=null,this.returnTo=null,this.el={loading:ye("loading"),loadBar:ye("loadBar"),loadText:ye("loadText"),mainMenu:ye("mainMenu"),pauseMenu:ye("pauseMenu"),starMap:ye("starMap"),helpPanel:ye("helpPanel"),journalPanel:ye("journalPanel"),scanResult:ye("scanResult"),starmapList:ye("starmapList"),starmapCanvas:ye("starmapCanvas"),starmapInfo:ye("starmapInfo"),helpGrid:ye("helpGrid"),journalBody:ye("journalBody"),scanResultKind:ye("scanResultKind"),scanResultName:ye("scanResultName"),scanResultSummary:ye("scanResultSummary"),scanResultStats:ye("scanResultStats")},this._buildHelp(),this._buildStarMapList(),this._wire(),this._panels={help:this.el.helpPanel,pause:this.el.pauseMenu,starmap:this.el.starMap,journal:this.el.journalPanel,scan:this.el.scanResult,menu:this.el.mainMenu},this._prevFocus=null,this._onKeyDownCapture=this._handleKeyDownCapture.bind(this),document.addEventListener("keydown",this._onKeyDownCapture,!0),yh(()=>{this._buildHelp(),this._buildStarMapList(),this.active==="journal"&&this.renderJournal(),this.active==="starmap"&&this.drawStarMap()})}_focusables(t){return t?[...t.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(n=>n.offsetParent!==null):[]}_captureFocus(){const t=document.activeElement;this._prevFocus=t&&t!==document.body?t:null}_restoreFocus(){const t=this._prevFocus;if(this._prevFocus=null,t&&document.contains(t)&&t.offsetParent!==null&&typeof t.focus=="function"){t.focus({preventScroll:!0});return}const e=document.getElementById("scene");e&&typeof e.focus=="function"&&e.focus({preventScroll:!0})}_handleKeyDownCapture(t){if(t.key!=="Tab"||!this.active)return;const e=this._panels[this.active];if(!e)return;const n=this._focusables(e);if(!n.length)return;const s=n[0],r=n[n.length-1],a=document.activeElement;if(!e.contains(a)){t.preventDefault(),(t.shiftKey?r:s).focus({preventScroll:!0});return}t.shiftKey&&a===s?(t.preventDefault(),r.focus({preventScroll:!0})):!t.shiftKey&&a===r&&(t.preventDefault(),s.focus({preventScroll:!0}))}_buildHelp(){this.el.helpGrid.innerHTML=cv.map(([t,e])=>`<div class="help-row"><span class="k">${_t(t)}</span><span class="d">${_t(e)}</span></div>`).join("")}_buildStarMapList(){this.el.starmapList.innerHTML=Ui.map((t,e)=>`
        <button class="starmap-item${e===0?" active":""}" data-target="${t.id}">
          <div class="name">${te(t,"name")}</div>
          <div class="meta">${te(t,"subtitle")}</div>
        </button>`).join(""),this.el.starmapList.querySelectorAll(".starmap-item").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.target;this.selected=Ui.find(n=>n.id===e)||Ui[0],this.el.starmapList.querySelectorAll(".starmap-item").forEach(n=>{n.classList.toggle("active",n===t)}),this._updateStarMapInfo(),this.bus.emit("ui:click")})}),this._updateStarMapInfo()}_updateStarMapInfo(){const t=vh.find(n=>n.id===this.selected.region),e=this.selected;this.el.starmapInfo.innerHTML=`
      <b>${te(e,"name")}</b>
      ${te(e,"info")}
      <div style="margin-top:10px;font-family:var(--ds-font-mono);font-size:12.5px;color:var(--ds-ink-faint)">
        ${_t("starmap.region")}: ${t?te(t,"name"):"—"}<br>
        ${_t("starmap.coords")}: X ${Math.round(e.position.x)} · Y ${Math.round(e.position.y)} · Z ${Math.round(e.position.z)}
      </div>`}_wire(){const t=(e,n)=>{const s=ye(e);s&&s.addEventListener("click",()=>{this.bus.emit("ui:click"),n()})};t("btnStart",()=>this.bus.emit("ui:start")),t("btnHelpMenu",()=>this.open("help","menu")),t("btnSettings",()=>this.open("pause","menu")),t("btnJournalMenu",()=>{this.renderJournal(),this.open("journal","menu")}),t("btnResume",()=>this.bus.emit("ui:resume")),t("btnHelp",()=>this.open("help","pause")),t("btnReset",()=>this.bus.emit("ui:reset")),t("btnQuit",()=>this.bus.emit("ui:quit")),t("btnJump",()=>{const e=this.selected;this.close(),this.bus.emit("ui:jump",e)}),t("btnCloseStarMap",()=>this.close()),t("btnCloseHelp",()=>this.close()),t("btnCloseJournal",()=>this.close()),t("btnCloseScan",()=>this.close())}open(t,e=null){this.active||this._captureFocus(),this._hideAll(),this.active=t,this.returnTo=e,document.body.classList.add("ds-overlay-open");const n=this._panels[t];if(n){n.classList.remove("hidden"),n.setAttribute("data-open","true");const s=n.querySelector(".ds-in");s&&(s.classList.remove("is-visible"),requestAnimationFrame(()=>s.classList.add("is-visible")));const r=this._focusables(n)[0];if(r)try{r.focus({preventScroll:!0})}catch{r.focus()}}t==="starmap"&&this.drawStarMap(),t==="journal"&&this.renderJournal(),this.bus.emit("ui:overlay",{name:t,open:!0})}close(){const t=this.active;if(this._hideAll(),this.active=null,document.body.classList.remove("ds-overlay-open"),t&&this.bus.emit("ui:overlay",{name:null,open:!1}),this.returnTo){const e=this.returnTo;this.returnTo=null,this.open(e);return}this._restoreFocus()}_hideAll(){for(const t of[this.el.mainMenu,this.el.pauseMenu,this.el.starMap,this.el.helpPanel,this.el.journalPanel,this.el.scanResult]){t.classList.add("hidden"),t.removeAttribute("data-open");const e=t.querySelector(".ds-in");e&&e.classList.remove("is-visible")}}hideLoading(){this.el.loading.classList.add("hidden")}setLoading(t,e){this.el.loadText.textContent=t,this.el.loadBar.style.width=`${Math.round(e*100)}%`}drawStarMap(t=null){const e=this.el.starmapCanvas,n=e.getContext("2d"),s=e.width,r=e.height;n.fillStyle="#08070a",n.fillRect(0,0,s,r),n.strokeStyle="rgba(233,169,61,0.10)",n.lineWidth=1;for(let M=0;M<=8;M++){const x=M/8*s;n.beginPath(),n.moveTo(x,0),n.lineTo(x,r),n.stroke(),n.beginPath(),n.moveTo(0,x),n.lineTo(s,x),n.stroke()}const a=[Ae.position,Ge[0].position,Ge[1].position,ue.center,kt.position,Me.position,...Ui.map(M=>M.position)];t&&a.push(t);const o=new jn().setFromPoints(a);o.expandByScalar(600);const l=(o.min.x+o.max.x)/2,c=(o.min.z+o.max.z)/2,h=Math.max(o.max.x-o.min.x,o.max.z-o.min.z),u=(Math.min(s,r)-50)/h,d=M=>({x:s/2+(M.x-l)*u,y:r/2+(M.z-c)*u}),p=d(Ae.position),g=n.createRadialGradient(p.x,p.y,0,p.x,p.y,26);g.addColorStop(0,"rgba(255,232,190,0.95)"),g.addColorStop(.35,"rgba(255,170,80,0.35)"),g.addColorStop(1,"rgba(255,140,40,0)"),n.fillStyle=g,n.beginPath(),n.arc(p.x,p.y,26,0,Math.PI*2),n.fill(),n.fillStyle="#F3E7D2",n.font="10px Menlo, monospace",n.textAlign="center",n.fillText(_t("marker.star"),p.x,p.y+34);const _=(M,x,y,L)=>{const R=d(M),b=Math.max(3,Math.min(20,x*u));return n.fillStyle=y,n.beginPath(),n.arc(R.x,R.y,b,0,Math.PI*2),n.fill(),n.strokeStyle="rgba(255,235,200,0.28)",n.lineWidth=1,n.stroke(),n.fillStyle="rgba(243,231,210,0.85)",n.font="10px Menlo, monospace",n.fillText(L,R.x,R.y-b-6),R};_(Ge[0].position,800,"#9a6236",te(Ge[0],"name"));const f=_(Ge[1].position,520,"#6f9cbc",te(Ge[1],"name"));n.strokeStyle="rgba(255,240,215,0.45)",n.beginPath(),n.ellipse(f.x,f.y,1180*u,1180*u*.32,.4,0,Math.PI*2),n.stroke();const m=d(ue.center);n.strokeStyle="rgba(216,180,138,0.45)",n.setLineDash([4,5]),n.beginPath(),n.ellipse(m.x,m.y,ue.majorRadius*u,ue.majorRadius*u*.55,.2,0,Math.PI*2),n.stroke(),n.setLineDash([]);for(const M of Ui){const x=d(M.position),y=M.id===this.selected.id;n.strokeStyle=y?"#E9A93D":"rgba(233,169,61,0.5)",n.lineWidth=y?2:1,n.beginPath(),n.moveTo(x.x,x.y-7),n.lineTo(x.x+7,x.y),n.lineTo(x.x,x.y+7),n.lineTo(x.x-7,x.y),n.closePath(),n.stroke(),y&&(n.fillStyle="rgba(233,169,61,0.18)",n.beginPath(),n.arc(x.x,x.y,14,0,Math.PI*2),n.fill())}if(t){const M=d(t);n.fillStyle="#F3E7D2",n.beginPath(),n.moveTo(M.x,M.y-8),n.lineTo(M.x+5,M.y+6),n.lineTo(M.x,M.y+3),n.lineTo(M.x-5,M.y+6),n.closePath(),n.fill()}}renderJournal(){const t=this.save.data.discoveries,e=r=>(ps()==="en"?uc[r]:hc[r])||r,n=ys.map(r=>{const a=t[r.id],o=a?new Date(a.at).toLocaleString(ps()==="en"?"en-GB":"zh-CN"):_t("journal.needScan");return`
        <div class="journal-entry${a?"":" locked"}">
          <div class="jt">${a?te(r,"name"):_t("journal.unlogged")}</div>
          <div class="jk">${e(r.kind)} · ${o}</div>
          <div class="jd">${a?te(r,"summary"):_t("journal.needScanDesc")}</div>
        </div>`}).join(""),s=`
      <div class="journal-entry">
        <div class="jt">${_t("journal.summary")}</div>
        <div class="jk">VOYAGE SUMMARY</div>
        <div class="jd">${_t("journal.stat",{logged:this.save.discoveryCount,total:ys.length,missions:Object.keys(this.save.data.missions).length,jumps:this.save.data.jumps,docks:this.save.data.dockedCount,distance:(this.save.data.totalDistance/1e3).toFixed(1),credits:this.save.data.credits})}</div>
      </div>`;this.el.journalBody.innerHTML=s+n}showScanResult(t,e={}){const n=(ps()==="en"?uc[t.kind]:hc[t.kind])||t.kind;this.el.scanResultKind.textContent=n,this.el.scanResultName.textContent=te(t,"name"),this.el.scanResultSummary.textContent=te(t,"summary")||"";const s=[[_t("scan.stat.radius"),`${(t.radius/10).toFixed(1)} km`],[_t("scan.stat.distance"),e.distance!=null?`${(e.distance/10).toFixed(1)} km`:"—"],[_t("scan.stat.kind"),n],[_t("scan.stat.time"),new Date().toLocaleTimeString(ps()==="en"?"en-GB":"zh-CN")]];this.el.scanResultStats.innerHTML=s.map(([r,a])=>`<div><span>${r}</span><b>${a}</b></div>`).join(""),this.open("scan")}}class uv{constructor(t=512,e=384){this.canvas=document.createElement("canvas"),this.canvas.width=t,this.canvas.height=e,this.ctx=this.canvas.getContext("2d"),this.dirty=!0,this._accum=0}update(t,e,n=15){this._accum+=t,!(this._accum<1/n)&&(this._accum=0,this.draw(e))}draw(t){const e=this.ctx,n=this.canvas.width,s=this.canvas.height,r=e.createLinearGradient(0,0,0,s);r.addColorStop(0,"#171009"),r.addColorStop(1,"#0a0705"),e.fillStyle=r,e.fillRect(0,0,n,s),e.save(),e.globalAlpha=.5,e.strokeStyle="#2b2114",e.lineWidth=1;for(let b=0;b<n;b+=32)e.beginPath(),e.moveTo(b,0),e.lineTo(b,s),e.stroke();for(let b=0;b<s;b+=32)e.beginPath(),e.moveTo(0,b),e.lineTo(n,b),e.stroke();e.restore();const a="#E9A93D",o="#F3E7D2",l="rgba(233,169,61,0.46)",c=104,h=108,u=76;e.save(),e.beginPath(),e.arc(c,h,u,0,Math.PI*2),e.clip(),e.save(),e.translate(c,h),e.rotate(-t.roll);const d=t.pitch/(Math.PI/4)*u;e.translate(0,d);const p=e.createLinearGradient(0,-u*2,0,0);p.addColorStop(0,"#2f4655"),p.addColorStop(1,"#4a7183"),e.fillStyle=p,e.fillRect(-u*2,-u*3,u*4,u*3),e.fillStyle="#4a3316",e.fillRect(-u*2,0,u*4,u*3),e.strokeStyle="#F3E7D2",e.lineWidth=1.6,e.beginPath(),e.moveTo(-u*2,0),e.lineTo(u*2,0),e.stroke(),e.strokeStyle="rgba(243,231,210,0.75)",e.font='11px "Menlo", monospace',e.textAlign="center",e.fillStyle="rgba(243,231,210,0.8)";for(let b=-60;b<=60;b+=15){if(b===0)continue;const P=-(b/45)*u,N=b%30===0?26:14;e.beginPath(),e.moveTo(-N,P),e.lineTo(N,P),e.stroke()}e.restore(),e.strokeStyle=l,e.lineWidth=1.2;for(let b=-60;b<=60;b+=15){if(b===0)continue;const P=(b-90)*Math.PI/180,N=u-8,v=u-(b%30===0?18:12);e.beginPath(),e.moveTo(c+Math.cos(P)*N,h+Math.sin(P)*N),e.lineTo(c+Math.cos(P)*v,h+Math.sin(P)*v),e.stroke()}e.restore(),e.strokeStyle=a,e.lineWidth=2,e.beginPath(),e.arc(c,h,u,0,Math.PI*2),e.stroke(),e.strokeStyle=o,e.lineWidth=2.4,e.beginPath(),e.moveTo(c-26,h),e.lineTo(c-9,h),e.lineTo(c,h+7),e.lineTo(c+9,h),e.lineTo(c+26,h),e.stroke(),e.fillStyle=o,e.fillRect(c-2,h-2,4,4),e.fillStyle=a,e.font='bold 12px "Menlo", monospace',e.textAlign="left",e.fillText("ATT",c-u,h-u-8),e.fillStyle=l,e.font='11px "Menlo", monospace',e.fillText(`P ${(t.pitch*57.2958).toFixed(0).padStart(4)}°  R ${(t.roll*57.2958).toFixed(0).padStart(4)}°`,c-u,h+u+16),e.fillStyle="rgba(14,10,6,0.88)",e.fillRect(0,0,46,210),e.strokeStyle=l,e.strokeRect(.5,.5,45,209),e.fillStyle=a,e.font='10px "Menlo", monospace',e.textAlign="center",e.fillText("SPD",23,14),e.fillStyle="#F3E7D2",e.font='bold 13px "Menlo", monospace',e.fillText(`${Math.round(t.speedMs)}`,23,100),e.font='10px "Menlo", monospace',e.fillStyle=l,e.fillText("m/s",23,114);const g=348,_=116,f=84;e.save(),e.beginPath(),e.arc(g,_,f,0,Math.PI*2),e.clip(),e.fillStyle="#0a0805",e.fillRect(g-f,_-f,f*2,f*2),e.strokeStyle="rgba(233,169,61,0.2)",e.lineWidth=1;for(const b of[.33,.66,1])e.beginPath(),e.arc(g,_,f*b,0,Math.PI*2),e.stroke();e.beginPath(),e.moveTo(g-f,_),e.lineTo(g+f,_),e.moveTo(g,_-f),e.lineTo(g,_+f),e.stroke();for(const b of t.contacts||[]){const P=g+b.x*f,N=_+b.y*f;Math.abs(P-g)>f||Math.abs(N-_)>f||(e.fillStyle=b.color||a,e.beginPath(),e.arc(P,N,3.4,0,Math.PI*2),e.fill(),e.font='9px "Menlo", monospace',e.textAlign="left",e.fillText(b.label,P+5,N+3))}e.strokeStyle=o,e.lineWidth=1.6,e.beginPath(),e.moveTo(g,_-7),e.lineTo(g+5,_+6),e.lineTo(g,_+3),e.lineTo(g-5,_+6),e.closePath(),e.stroke(),e.restore(),e.strokeStyle=a,e.lineWidth=2,e.beginPath(),e.arc(g,_,f,0,Math.PI*2),e.stroke(),e.fillStyle=a,e.font='bold 12px "Menlo", monospace',e.textAlign="left",e.fillText("NAV SCAN",g-f,_-f-8);const m=12,M=232;e.fillStyle="rgba(14,10,6,0.88)",e.fillRect(m,M,236,140),e.strokeStyle=l,e.strokeRect(m+.5,M+.5,235,139),e.font='11px "Menlo", monospace',e.textAlign="left",e.fillStyle=a,e.fillText("SHIP STATUS",m+10,M+18);const x=(b,P,N,v)=>{const w=M+34+b*22;e.fillStyle=l,e.fillText(P,m+10,w+9),e.fillStyle="rgba(243,231,210,0.08)",e.fillRect(m+86,w,118,10),e.fillStyle=v,e.fillRect(m+86,w,118*Math.max(0,Math.min(1,N)),10),e.fillStyle="#F3E7D2",e.textAlign="right",e.fillText(`${Math.round(N*100)}`,m+226,w+9),e.textAlign="left"};x(0,"FUEL",t.fuel/100,t.fuel<25?"#E2573C":a),x(1,"HULL",t.hull/100,t.hull<35?"#E2573C":"#6FCF97"),x(2,"SHIELD",t.shield,"#B9A6E6"),e.fillStyle=l,e.font='11px "Menlo", monospace',e.fillText("REGION",m+10,M+118),e.fillStyle="#F3E7D2",e.font='bold 12px "Menlo", monospace',e.fillText(t.region||"—",m+86,M+118);const y=262;e.fillStyle="rgba(14,10,6,0.88)",e.fillRect(y,M,238,140),e.strokeStyle=l,e.strokeRect(y+.5,M+.5,237,139),e.font='11px "Menlo", monospace',e.fillStyle=a,e.fillText("TARGET",y+10,M+18),e.font='bold 14px "Menlo", monospace',e.fillStyle=t.targetName?"#F3E7D2":l,e.fillText(t.targetName||"无目标",y+10,M+38),e.font='11px "Menlo", monospace',e.fillStyle=l,e.fillText("RANGE",y+10,M+58),e.fillStyle="#F3E7D2",e.font='bold 12px "Menlo", monospace',e.fillText(t.targetRange!=null?`${(t.targetRange/10).toFixed(1)} km`:"—",y+96,M+58);const L=y+168,R=M+62;e.strokeStyle="rgba(99,232,255,0.2)",e.lineWidth=6,e.beginPath(),e.arc(L,R,26,0,Math.PI*2),e.stroke(),t.scanProgress>0&&(e.strokeStyle="#ffb45c",e.lineWidth=6,e.beginPath(),e.arc(L,R,26,-Math.PI/2,-Math.PI/2+t.scanProgress*Math.PI*2),e.stroke()),e.fillStyle=l,e.font='9px "Menlo", monospace',e.textAlign="center",e.fillText("SCAN",L,R+40),e.textAlign="left",t.warp>0&&(e.fillStyle="rgba(226,87,60,0.18)",e.fillRect(y,M-26,238,22),e.fillStyle="#E9A93D",e.font='bold 13px "Menlo", monospace',e.textAlign="center",e.fillText("JUMP CHARGE",y+119,M-10),e.textAlign="left"),e.fillStyle="rgba(12,9,5,0.92)",e.fillRect(0,0,n,26),e.fillStyle=a,e.font='bold 13px "Menlo", monospace',e.textAlign="left",e.fillText("FG-1 NAVIGATOR",12,18),e.textAlign="right",e.fillStyle=t.warning?"#ff6b6b":l,e.fillText(t.warning||`HDG ${(t.heading*57.2958).toFixed(0).padStart(3)}°`,n-12,18),this.dirty=!0}}class dv{constructor(t=256){this.canvas=document.createElement("canvas"),this.canvas.width=t,this.canvas.height=t,this.ctx=this.canvas.getContext("2d"),this._accum=0}update(t,e,n=12){this._accum+=t,!(this._accum<1/n)&&(this._accum=0,this.draw(e))}draw(t){const e=this.ctx,n=this.canvas.width,s=this.canvas.height,r=n/2,a=s/2,o=n*.44;e.fillStyle="#100b06",e.beginPath(),e.arc(r,a,o,0,Math.PI*2),e.fill(),e.strokeStyle="rgba(233,169,61,0.95)",e.lineWidth=5,e.beginPath(),e.arc(r,a,o-3,0,Math.PI*2),e.stroke(),e.save(),e.translate(r,a),e.rotate(-t.heading);for(let h=0;h<72;h++){const u=h/72*Math.PI*2,d=h%9===0,p=d?20:h%3===0?12:7;e.strokeStyle=d?"rgba(255,243,222,1)":"rgba(233,169,61,0.85)",e.lineWidth=d?4:2.5,e.beginPath(),e.moveTo(Math.sin(u)*(o-12),-Math.cos(u)*(o-12)),e.lineTo(Math.sin(u)*(o-12-p),-Math.cos(u)*(o-12-p)),e.stroke()}e.font='bold 26px "Menlo", monospace',e.textAlign="center",e.textBaseline="middle";const l=[["N",0],["E",90],["S",180],["W",270]];for(const[h,u]of l){const d=(u-90)*Math.PI/180;e.fillStyle=h==="N"?"#E9A93D":"rgba(243,231,210,0.72)",e.fillText(h,Math.cos(d)*(o-34),Math.sin(d)*(o-34))}e.restore(),e.strokeStyle="#F3E7D2",e.lineWidth=2.5,e.beginPath(),e.moveTo(r,a-o+14),e.lineTo(r,a-o+34),e.stroke(),e.strokeStyle="#F3E7D2",e.lineWidth=2,e.beginPath(),e.moveTo(r-13,a),e.lineTo(r-5,a),e.lineTo(r,a+6),e.lineTo(r+5,a),e.lineTo(r+13,a),e.stroke();const c=Math.max(-1,Math.min(1,t.slip));e.fillStyle="rgba(0,0,0,0.6)",e.beginPath(),e.ellipse(r,a+52,42,12,0,0,Math.PI*2),e.fill(),e.strokeStyle="rgba(233,169,61,0.4)",e.lineWidth=1,e.stroke(),e.fillStyle="#E9A93D",e.beginPath(),e.arc(r+c*36,a+52,6,0,Math.PI*2),e.fill(),e.font='9px "Menlo", monospace',e.textAlign="left",e.fillStyle="rgba(233,169,61,0.7)",e.fillText("V/S",8,20),e.fillStyle="#F3E7D2",e.font='bold 13px "Menlo", monospace',e.fillText(`${Math.round(t.verticalSpeed*100)}`,8,36),e.font='9px "Menlo", monospace',e.fillStyle="rgba(233,169,61,0.7)",e.fillText("ALT",n-34,20),e.fillStyle="#F3E7D2",e.font='bold 13px "Menlo", monospace',e.textAlign="right",e.fillText(`${t.altitudeKm.toFixed(1)}`,n-8,36)}}const Ni=[{id:"leave-beacon",title:"离开灯塔站",titleEn:"Leave Beacon Station",desc:"脱离泊位，把霜隙号开出灯塔站 6 公里以外。",descEn:"Undock and fly FG-1 more than 6 km clear of Beacon Station.",hint:"R 脱离泊位 → W 推进 → Shift 后燃",hintEn:"R to undock → W to thrust → Shift for the burner",progress:i=>Math.min(1,i.distToStation/60),check:i=>i.distToStation>60},{id:"cruise-check",title:"通过巡航检定",titleEn:"Pass the cruise check",desc:"把航速推到 400 m/s 以上，确认推进系统工作正常。",descEn:"Push the speed past 400 m/s to confirm the drive is healthy.",hint:"按住 W，必要时用 Shift",hintEn:"Hold W, add Shift if needed",progress:i=>Math.min(1,i.speedMs/400),check:i=>i.speedMs>400},{id:"archive-velan",title:"为维岚建立档案",titleEn:"File Velan",desc:"把准星对准气态巨行星维岚，按 F 启动天体扫描。",descEn:"Aim the reticle at the gas giant Velan and press F to scan it.",hint:"对准行星后按 F",hintEn:"Line up the planet, then press F",progress:i=>i.save.hasDiscovered("velan")?1:i.scanProgress,check:i=>i.save.hasDiscovered("velan")},{id:"first-jump",title:"跨越第一段空隙",titleEn:"Cross the first gap",desc:"打开星图，把航向指向碎屑回廊并执行跃迁。",descEn:"Open the chart, set a course for the Debris Gallery and execute the jump.",hint:"按 M 打开星图",hintEn:"Press M for the chart",progress:i=>Math.min(1,i.save.data.jumps/1),check:i=>i.save.data.jumps>=1},{id:"gallery-anomaly",title:"辨认回廊里的异物",titleEn:"Identify what is out there",desc:"在碎屑回廊中找到并扫描任意一处未登记异常体。",descEn:"Find and scan any unlogged anomaly inside the Debris Gallery.",hint:"对准发光的异常体后按 F",hintEn:"Aim at a lit anomaly, then press F",progress:i=>i.anomalyDiscovered?1:i.scanProgress,check:i=>i.anomalyDiscovered},{id:"archive-frostgap",title:"为霜隙建立档案",titleEn:"File Frostgap",desc:"跃迁到霜隙环系，扫描这颗带环的冰巨星。",descEn:"Jump to the Frostgap system and scan this ringed ice giant.",hint:"星图 → 霜隙环系",hintEn:"Chart → Frostgap system",progress:i=>i.save.hasDiscovered("frostgap")?1:i.scanProgress,check:i=>i.save.hasDiscovered("frostgap")},{id:"return-beacon",title:"回到灯塔",titleEn:"Return to the beacon",desc:"返回灯塔站，对准泊位导引灯按 R 完成停靠与补给。",descEn:"Come back to Beacon Station, line up on the berth lights and press R to dock and resupply.",hint:"减速到 300 m/s 以下后按 R",hintEn:"Slow below 300 m/s, then press R",progress:i=>i.docked?1:Math.max(0,1-i.distToPort/400),check:i=>i.docked},{id:"free-voyage",title:"自由远航",titleEn:"Open voyage",desc:"既定航程完成。接下来由你决定，把十个目标全部登记进档案。",descEn:"The set course is done. The rest is yours — log all ten targets.",hint:"按 M 查看星图，按 F 扫描天体",hintEn:"Press M for the chart, F to scan",progress:i=>i.save.discoveryCount/10,check:i=>i.save.discoveryCount>=10}];class fv{constructor(t,e){for(this.save=t,this.bus=e,this.index=0;this.index<Ni.length&&t.isMissionComplete(Ni[this.index].id);)this.index+=1}get current(){return Ni[Math.min(this.index,Ni.length-1)]}get completedCount(){return this.save?Object.keys(this.save.data.missions).length:0}get total(){return Ni.length}evaluate(t){const e=this.current;e&&e.check(t)&&(this.save.completeMission(e.id),this.index=Math.min(this.index+1,Ni.length),this.bus.emit("mission:complete",{mission:e,next:this.current}))}}const ba=1/120,Mc={irda:"IRDA",velan:"VELN",frostgap:"FRST",korai:"KORA",morn:"MORN",beacon:"BEAC","kalso-array":"KALS"},Sc=8,$t=new T,si=new T,wc=new T,pv=new rn;class mv{constructor(){this.canvas=document.getElementById("scene"),this.settings=new wg,this.save=new Eg,this.bus=new bg,this.audio=new Ag,this.input=new Tg(document.body),this.hud=new lv,this.overlays=new hv(this.bus,this.save),this.state="loading",this.quality=this.settings.quality,this._lockLossPauseAt=0,this.ship=new Qg(this.settings),this.missions=new fv(this.save,this.bus),this.accumulator=0,this.lastTime=performance.now(),this.elapsed=0,this.scan={active:!1,target:null,progress:0,duration:2.6,pingTimer:0},this.warp=null,this.docked=!0,this.dockAnim=0,this.shake=0,this.warning="",this.proximityTimer=0,this.scanCandidate=null,this.nearestName="—",this.nearestDistance=1/0,this.hazard=0,this.cameraMode=this.settings.get("cameraMode"),this.chasePosition=new T,this.chaseLook=new T,this.camOffset=new T,this.discoveredAnomaly=!1,this._bindEvents()}async init(){this._initRenderer(),this._initScene(),await this._buildWorld(),this._initPost(),this.overlays.hideLoading(),this.overlays.open("menu"),this.state="menu",this._syncShellChrome(),this.loop=this.loop.bind(this),requestAnimationFrame(this.loop),window.addEventListener("resize",()=>this._onResize()),this._onResize()}_initRenderer(){const t=new URLSearchParams(window.location.search),e=t.get("quality");e&&xs[e]&&(this.settings.set("quality",e),this.quality=this.settings.quality),this.renderer=new S0({canvas:this.canvas,antialias:this.quality.pixelRatio<=1.25,powerPreference:"high-performance",stencil:!1}),this.forceGpu=t.get("gpu")==="force",this.renderTier="gpu",this.gpuName="unknown";try{const n=this.renderer.getContext(),s=n.getExtension("WEBGL_debug_renderer_info");this.gpuName=String(s?n.getParameter(s.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER)),/swiftshader|llvmpipe|software|mesa offscreen/i.test(this.gpuName)&&(this.renderTier="software")}catch(n){console.warn("[Game] renderer probe failed",n)}this.renderTier==="software"&&!this.forceGpu?(console.warn(`[Game] software rasteriser detected (${this.gpuName}) — forcing low quality`),this.settings.set("quality","low"),this.quality=this.settings.quality,this.renderer.setPixelRatio(.75)):this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this.quality.pixelRatio)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.outputColorSpace=Xe,this.renderer.toneMapping=wo,this.renderer.toneMappingExposure=.94,this.renderer.setClearColor(132362,1)}_initScene(){this.scene=new ah,this.camera=new Qe(this.settings.get("fov"),window.innerWidth/window.innerHeight,.06,9e4),this.scene.add(this.camera),this.universe=new vc(this.scene,this.quality),this.warpOverlay=Wg(),this.warpIntensity=0}async _buildWorld(){this.overlays.setLoading(_t("load.generating"),.02),await xo();const t=performance.now();await this.universe.build((e,n)=>this.overlays.setLoading(e,n)),console.info(`[Game] world built in ${(performance.now()-t).toFixed(0)}ms`),this.mfd=new uv(512,384),this.mfdTexture=new po(this.mfd.canvas),this.mfdTexture.colorSpace=Xe,this.mfdTexture.minFilter=tn,this.gauge=new dv(256),this.gaugeTexture=new po(this.gauge.canvas),this.gaugeTexture.colorSpace=Xe,this.gaugeTexture.minFilter=tn,this.cockpit=tv({mfdTexture:this.mfdTexture,gaugeTexture:this.gaugeTexture,quality:this.quality}),this.camera.add(this.cockpit.group),this.exterior=yc({quality:this.quality}),this.scene.add(this.exterior.group),this.exterior.group.visible=!1,this._attachToDock(),this._updateCamera(0)}_initPost(){const t=new Q(window.innerWidth,window.innerHeight);this.composer=new _g(this.renderer),this.composer.addPass(new xg(this.scene,this.camera)),this.bloom=new ji(t,.42,.55,.85),this.composer.addPass(this.bloom),this.composer.addPass(new Sg);const e=this.renderTier==="software"?.75:Math.min(window.devicePixelRatio,this.quality.pixelRatio);this.composer.setPixelRatio(e),this.composer.setSize(window.innerWidth,window.innerHeight),this.useComposer=this.quality.bloom&&this.renderTier!=="software"}_bindEvents(){this.bus.on("ui:start",()=>this.startGame()),this.bus.on("ui:resume",()=>this.resume()),this.bus.on("ui:reset",()=>this.resetShip()),this.bus.on("ui:quit",()=>this.toMenu()),this.bus.on("ui:jump",t=>this.startWarp(t)),this.bus.on("ui:click",()=>this.audio.uiClick()),this.bus.on("ui:overlay",({open:t})=>{t?this.input.releaseLock():this.state==="playing"&&this.input.requestLock()}),this.input.onKeyAction=t=>this._onKeyAction(t),this.input.captureTab=()=>this.state==="playing"&&!this.overlays.active,this.input.onPointerLockLost=()=>{this.state!=="playing"||this.overlays.active||this.input.tabPressedRecently()||performance.now()-this.input.lastEscapeAt()<400||(this._lockLossPauseAt=performance.now(),this.pause())},this._onVisibility=()=>{document.hidden&&this.state==="playing"&&!this.overlays.active&&this.pause()},document.addEventListener("visibilitychange",this._onVisibility),this.canvas.addEventListener("click",()=>{this.state==="playing"&&!this.overlays.active&&!this.input.pointerLocked&&this.input.requestLock()})}_onKeyAction(t){if(this.state==="menu"){const e=this.overlays.active&&this.overlays.active!=="menu";if(t==="Escape"){e&&this.resume();return}(t==="Enter"||t==="Space")&&!e&&this.startGame();return}switch(t){case"Escape":this._togglePause();break;case"KeyM":this.state==="playing"&&this.overlays.open("starmap");break;case"KeyH":this.state==="playing"&&this.overlays.open("help");break;case"KeyV":this.state==="playing"&&this._toggleCameraMode();break;case"KeyF":this.state==="playing"&&this._tryScan();break;case"KeyR":this.state==="playing"&&this._tryDock();break;case"Backspace":this.state==="playing"&&this.resetShip();break}}startGame(){this.input.requestLock(),this._blurFocus(),this.audio.init().then(()=>{this.audio.setVolume(this.settings.get("masterVolume")),this.audio.setMuted(this.settings.get("muted"))}),this.state="playing",this.overlays.close(),this._syncShellChrome(),this.hud.show(),this._showTutorialHints(),this.hud.toast(_t("toast.lockHint"),"good")}_showTutorialHints(){if(this.save.data.tutorialSeen)return;this.save.data.tutorialSeen=!0,this.save.save(),[_t("tutorial.0"),_t("tutorial.1"),_t("tutorial.2"),_t("tutorial.3"),_t("tutorial.4"),_t("tutorial.5")].forEach((e,n)=>setTimeout(()=>this.hud.toast(e),400+n*700))}_togglePause(){if(this.overlays.active){if(this._lockLossPauseAt&&performance.now()-this._lockLossPauseAt<600){this._lockLossPauseAt=0;return}const t=this.overlays.active;this.overlays.close(),t==="pause"||t==="menu"?this.resume():this.state==="playing"&&(this.state="playing");return}this.pause()}_syncShellChrome(){document.body.classList.toggle("ds-menu-shell",this.state==="menu")}pause(){this.state==="playing"&&(this.state="paused",this._syncShellChrome(),this.input.releaseLock(),this._blurFocus(),this._syncSettingsUI(),this.overlays.open("pause"),this.audio.setEngineLoad(0,0),this.audio.setThruster(0))}resume(){if(this.state==="menu"){this.overlays.open("menu");return}this.state="playing",this._syncShellChrome(),this._blurFocus(),this.overlays.close(),this.input.requestLock(),this.audio.resume()}_blurFocus(){const t=document.activeElement;t&&t!==document.body&&typeof t.blur=="function"&&t.blur()}toMenu(){this.overlays.close(),this.hud.hide(),this.state="menu",this._syncShellChrome(),this.input.releaseLock(),this.overlays.open("menu"),this.audio.setEngineLoad(0,0)}resetShip(){this.ship.reset(),this.docked=!0,this._attachToDock(),this.scan.active=!1,this.scan.progress=0,this.warp=null,this.warning="",this.hud.toast(_t("toast.reset"),"warn"),this.audio.uiClick(),this.overlays.active&&(this.overlays.close(),this.state==="paused"&&(this.state="playing",this._blurFocus(),this.input.requestLock()))}_toggleCameraMode(){this.cameraMode=this.cameraMode==="cockpit"?"chase":"cockpit",this.settings.set("cameraMode",this.cameraMode),this.cockpit.group.visible=this.cameraMode==="cockpit",this.exterior.group.visible=this.cameraMode==="chase",this.hud.toast(this.cameraMode==="cockpit"?_t("toast.camCockpit"):_t("toast.camChase"),"good")}_attachToDock(){const t=this.universe.station.portPosition;this.ship.position.copy(t).add(new T(0,5.5,0)),this.ship.velocity.set(0,0,0);const e=new T(.52,-.2,-.83).normalize();this.ship.quaternion.setFromUnitVectors(new T(0,0,-1),e),this.ship._syncBasis(),this.docked=!0,this.save.data.docked=!0}_dockDistance(){return this.ship.position.distanceTo(this.universe.station.portPosition)}_tryDock(){if(this.docked){this.docked=!1,this.save.data.docked=!1,this.ship.position.copy(this.universe.station.portPosition).add(new T(0,16,0)),this.ship.velocity.set(0,0,0),this.hud.toast(_t("toast.undock"),"good"),this.audio.uiClick();return}const t=this._dockDistance(),e=this.ship.speed;if(t>kt.dockRadius*3.4){this.hud.toast(_t("toast.dockTooFar"),"bad"),this.audio.alert();return}if(e>3.2){this.hud.toast(_t("toast.dockTooFast",{speed:Math.round(e*An)}),"warn"),this.audio.alert();return}this.docked=!0,this.save.data.docked=!0,this.save.data.dockedCount+=1,this.ship.position.copy(this.universe.station.portPosition).add(new T(0,5.5,0)),this.ship.velocity.set(0,0,0),this.ship.fuel=ae.fuelCapacity,this.ship.hull=Math.min(ae.hullMax,this.ship.hull+18),this.dockAnim=1,this.hud.toast(_t("toast.dockDone"),"good"),this.audio.dockSuccess(),this.save.save()}_findScanCandidate(){let t=null,e=-1/0;const n=this.ship.forward;for(const s of ys){if(s.id==="aurelion"&&this.docked)continue;$t.copy(s.position).sub(this.ship.position);const r=$t.length();if(r>s.scanRange)continue;const a=$t.normalize().dot(n);if(a<.72)continue;const o=a*2.2-r/(s.scanRange*4);o>e&&(e=o,t={...s,distance:r})}return t}_tryScan(){if(this.scan.active)return;const t=this.scanCandidate;if(!t){this.hud.toast(_t("toast.noScanTarget"),"warn"),this.audio.alert();return}this.scan.active=!0,this.scan.target=t,this.scan.progress=0,this.scan.pingTimer=0,this.hud.toast(_t("toast.scanStart",{name:te(t,"name")}),"good")}_updateScan(t){if(!this.scan.active)return;const e=this.scan.target;if(this.ship.position.distanceTo(e.position)>e.scanRange*1.25){this.scan.active=!1,this.hud.toast(_t("toast.scanLost"),"bad");return}this.scan.progress+=t/this.scan.duration,this.scan.pingTimer-=t,this.scan.pingTimer<=0&&(this.scan.pingTimer=.45,this.audio.scanPing(Math.floor(this.scan.progress*5))),this.scan.progress>=1&&(this.scan.active=!1,this.scan.progress=0,this._completeScan(e))}_completeScan(t){const e=this.save.discover(t.id,t.name,t.kind);this.audio.scanComplete(),e?(this.hud.toast(_t("toast.newRecord",{name:te(t,"name")}),"good"),t.kind==="anomaly"&&(this.discoveredAnomaly=!0)):this.hud.toast(_t("toast.archived",{name:te(t,"name")}),"good"),this.overlays.showScanResult(t,{distance:this.ship.position.distanceTo(t.position)})}startWarp(t){if(this.warp)return;this.warp={target:t,from:this.ship.position.clone(),to:t.position.clone(),control:new T,t:0,charge:.95,travel:1.5,jumped:!1};const e=this.warp.from.clone().add(this.warp.to).multiplyScalar(.5),n=$t.copy(this.warp.to).sub(this.warp.from).normalize(),s=si.crossVectors(n,new T(0,1,0)).normalize();s.lengthSq()<.001&&s.set(1,0,0),e.addScaledVector(s,this.warp.from.distanceTo(this.warp.to)*.16),this.warp.control.copy(e),this.ship.velocity.set(0,0,0),this.audio.warpCharge(this.warp.charge+this.warp.travel),this.hud.toast(_t("toast.routeLocked",{name:te(t,"name")}),"good")}_updateWarp(t){const e=this.warp;if(!e)return;e.t+=t;const n=e.charge+e.travel;if(e.t<e.charge){const s=e.t/e.charge;this.warpIntensity=Math.pow(s,1.6)*.85,this.ship.position.copy(e.from)}else{e.jumped||(e.jumped=!0,this.audio.warpJump(),this.hud.flash(.35,.5));const s=Math.min(1,(e.t-e.charge)/e.travel),r=s*s*(3-2*s),a=$t.copy(e.from).multiplyScalar((1-r)*(1-r)),o=si.copy(e.control).multiplyScalar(2*(1-r)*r),l=wc.copy(e.to).multiplyScalar(r*r);this.ship.position.copy(a).add(o).add(l),this.warpIntensity=.85+Math.sin(s*Math.PI)*.9;const c=$t.copy(e.to).sub(e.from).normalize();si.copy(this.ship.position).addScaledVector(c,40);const h=new rn().setFromUnitVectors(new T(0,0,-1),c);this.ship.quaternion.slerp(h,Math.min(1,t*3)),this.ship._syncBasis()}e.t>=n&&(this.ship.position.copy(e.to),this.ship.velocity.set(0,0,0),this.warp=null,this.warpIntensity=0,this.save.data.jumps+=1,this.save.save(),this.hud.toast(_t("toast.warpDone",{name:te(e.target,"name")}),"good"))}_resolveCollisions(t){const e=this.ship.position;let n=!1,s=0,r="";const a=[...Ge.map(d=>({def:d,atmo:d.atmosphere||1.02})),...Ar.map(d=>({def:d,atmo:1}))];for(const{def:d,atmo:p}of a){const g=d.radius;$t.copy(e).sub(d.position);const _=$t.length(),f=g*p;if(_<f&&p>1){n=!0;const m=1-(_-g)/(f-g);s=Math.max(s,.25+m*.75),m>.35&&(r=_t("warn.atmosphere",{name:te(d,"name")}))}if(_<g+1.5){const m=$t.normalize();this.ship.applyCollision(m,g+1.5-_,22,.15),this.shake=Math.min(1,this.shake+.9),this.audio.impact(1),r=_t("warn.impact",{name:te(d,"name")}),this.hud.flash(.25,.35)}_<g*1.14&&_>g+1.5&&(r=_t("warn.approach",{name:te(d,"name")}),s=Math.max(s,.3),this.proximityTimer-=t,this.proximityTimer<=0&&(this.proximityTimer=.9,this.audio.proximity()))}this.universe.station,$t.copy(e).sub(kt.position);const o=$t.length();if(o<14){const d=$t.normalize();this.ship.applyCollision(d,14-o,16,.2),this.shake=Math.min(1,this.shake+.8),this.audio.impact(.9),r=_t("warn.stationStructure")}const l=e.x-kt.position.x,c=e.y-kt.position.y,h=e.z-kt.position.z,u=Math.sqrt(l*l+h*h);if(Math.abs(u-kt.ringRadius)<4.5&&Math.abs(c)<4.5&&($t.set(l,0,h).normalize(),this.ship.applyCollision($t,4.5-Math.abs(u-kt.ringRadius),10,.25),this.shake=Math.min(1,this.shake+.6),this.audio.impact(.7),r=_t("warn.stationRing")),$t.copy(e).sub(Me.position),$t.length()<Me.radius*.9){const d=$t.normalize();this.ship.applyCollision(d,Me.radius*.9-$t.length(),12,.25),this.shake=Math.min(1,this.shake+.7),this.audio.impact(.8),r=_t("warn.kalsoArray")}for(const d of Object.values(this.universe.anomalies||{})){$t.copy(e).sub(d.def.position);const p=$t.length();if(p<d.colliderRadius+1.5){const g=$t.normalize();this.ship.applyCollision(g,d.colliderRadius+1.5-p,9,.3),this.shake=Math.min(1,this.shake+.5),this.audio.impact(.6),r=_t("warn.unknownStructure")}}if(e.distanceTo(ue.center)<ue.majorRadius+ue.tubeRadius+60){const d=this.universe.asteroidInstances;for(let p=0;p<d.length;p++){const g=d[p],_=e.x-g.position.x;if(_>40||_<-40)continue;const f=e.y-g.position.y;if(f>40||f<-40)continue;const m=e.z-g.position.z;if(m>40||m<-40)continue;const M=g.radius+1.6,x=_*_+f*f+m*m;if(x<M*M){const y=Math.sqrt(x)||1e-4,L=$t.set(_/y,f/y,m/y);this.ship.applyCollision(L,M-y,8,.3),this.shake=Math.min(1,this.shake+.45),this.audio.impact(.5),r=_t("warn.asteroid");break}}}this.ship.burning=n,this.hazard=s,this.warning=r}_checkDestruction(){this.ship.hull>0||(this.ship.hull=45,this.ship.fuel=Math.max(this.ship.fuel,30),this.save.addCredits(-150),this.docked=!0,this._attachToDock(),this.hud.flash(.7,.9),this.hud.toast(_t("toast.hullLost"),"bad"),this.audio.impact(1.4))}_gatherCommands(){const t=this.input;return{forward:t.isDown("KeyW"),back:t.isDown("KeyS"),left:t.isDown("KeyA"),right:t.isDown("KeyD"),up:t.isDown("Space"),down:t.isDown("ControlLeft")||t.isDown("ControlRight")||t.isDown("KeyC"),rollLeft:t.isDown("KeyQ"),rollRight:t.isDown("KeyE"),boost:t.isDown("ShiftLeft")||t.isDown("ShiftRight"),brake:t.isDown("KeyX")||t.isDown("KeyB"),keyPitchUp:t.isDown("ArrowUp"),keyPitchDown:t.isDown("ArrowDown"),keyYawLeft:t.isDown("ArrowLeft"),keyYawRight:t.isDown("ArrowRight")}}_fixedStep(t){const e=this._gatherCommands();this.warp?this._updateWarp(t):this.docked?(this.ship.velocity.multiplyScalar(Math.exp(-6*t)),this.ship.position.copy(this.universe.station.portPosition).add(new T(0,5.5,0))):(this.ship.step(t,e),this._resolveCollisions(t)),this._updateScan(t),this.distToStation=this.ship.position.distanceTo(kt.position),this.distToPort=this._dockDistance(),this._updateNearest(),this.warp||this.missions.evaluate({ship:this.ship,save:this.save,distToStation:this.distToStation,distToPort:this.distToPort,speedMs:this.ship.speed*An,scanProgress:this.scan.active?this.scan.progress:0,anomalyDiscovered:this.discoveredAnomaly||Object.keys(this.save.data.discoveries).some(n=>n.startsWith("anomaly")),docked:this.docked&&this.save.data.dockedCount>0,jumps:this.save.data.jumps}),this.save.data.totalDistance+=this.ship.speed*t*An}_updateNearest(){let t="—",e=1/0;for(const n of ys){const s=this.ship.position.distanceTo(n.position);s<e&&(e=s,t=te(n,"name"))}this.nearestName=t,this.nearestDistance=e}_updateCamera(t){const e=this.ship,n=this.settings.get("fov")+this.warpIntensity*14;if(this.camera.fov+=(n-this.camera.fov)*Math.min(1,t*4),this.camera.updateProjectionMatrix(),this.cameraMode==="cockpit"){this.camOffset.copy(ae.eyeOffset);const s=$t.copy(e.angularVelocity).multiplyScalar(.012);this.camOffset.x+=s.y,this.camOffset.y+=s.x*.6,this.camera.position.copy(this.camOffset).applyQuaternion(e.quaternion).add(e.position),this.camera.quaternion.copy(e.quaternion)}else{const s=$t.copy(e.forward).multiplyScalar(-17),r=si.copy(e.up).multiplyScalar(5.2),a=wc.copy(e.position).add(s).add(r),o=1-Math.exp(-8*t);this.chasePosition.lerp(a,o),this.camera.position.copy(this.chasePosition),this.camera.quaternion.copy(e.quaternion);const l=$t.copy(e.position).addScaledVector(e.forward,6);this.chaseLook.lerp(l,o),this.camera.lookAt(this.chaseLook)}if(this.shake>.001){const s=this.shake*.06;this.camera.position.x+=(Math.random()-.5)*s,this.camera.position.y+=(Math.random()-.5)*s,this.camera.position.z+=(Math.random()-.5)*s,this.shake*=Math.exp(-4*t)}}loop(t){requestAnimationFrame(this.loop);let e=(t-this.lastTime)/1e3;if(this.lastTime=t,(!isFinite(e)||e<0)&&(e=0),e=Math.min(e,.25),this.state==="playing"&&!this.overlays.active){this.elapsed+=e;const n=this.input.consumeMouseDelta();!this.docked&&!this.warp?this.ship.applyMouseDelta(n.dx,n.dy):this.input.consumeMouseDelta(),this.accumulator+=e;let s=0;for(;this.accumulator>=ba&&s<Sc;)this._fixedStep(ba),this.accumulator-=ba,s+=1;s>=Sc&&(this.accumulator=0),this._checkDestruction(),this._updateHUD(e)}else this.input.consumeMouseDelta();this._updateCamera(e),this.universe.update(e,this.camera.position),this._updateVisuals(e),this._render(),this.input.endFrame()}_updateVisuals(t){const e=this.cockpit.hologram.userData.uniforms;if(e.uTime.value=this.elapsed,e.uMode.value=this.scanCandidate?1:0,e.uOpacity.value=.3+Math.min(.5,this.ship.speed*.03),this.gauge.update(t,this._gaugeState(),Math.min(12,this.quality.mfdHz)),this.gaugeTexture.needsUpdate=!0,this.cameraMode==="chase"){this.exterior.group.position.copy(this.ship.position),this.exterior.group.quaternion.copy(this.ship.quaternion);const s=Math.min(1,Math.abs(this.ship.throttle)+(this.ship.boosting?1:0));for(const r of this.exterior.plumes)r.userData.uniforms.uTime.value=this.elapsed,r.userData.uniforms.uPower.value=.25+s*.9,r.scale.set(1,.4+s*1.4,1)}if(this.warpIntensity=Math.max(0,this.warpIntensity-t*1.6),this.warpOverlay.uniforms.uIntensity.value=this.warpIntensity,this.warpOverlay.uniforms.uTime.value=this.elapsed,this.cockpit.cabinLight){const s=this.ship.boosting?.35:0,r=this.ship.burning?.3:0;this.cockpit.cabinLight.intensity=.45+s+r,this.cockpit.cabinLight.color.setHex(this.ship.burning?16758903:10475775)}const n=Math.max(0,this.ship.throttle);this.audio.setEngineLoad(n,this.ship.speed),this.audio.setThruster(this.ship.boosting?1:n*.35),this.audio.setWind(Math.min(1,this.ship.speed/18)),this.audio.setAtmosphere(this.ship.burning?1:0)}_render(){this.useComposer&&this.composer?this.composer.render():this.renderer.render(this.scene,this.camera),this.warpIntensity>.001&&(this.renderer.autoClear=!1,this.renderer.clearDepth(),this.renderer.render(this.warpOverlay.scene,this.warpOverlay.camera),this.renderer.autoClear=!0)}_updateHUD(t){const e=this.ship,n=e.speed*An,s=this.universe.regionAt(e.position),r=e.position;this.hud.setRegion(s.region?te(s.region,"name"):_t("hud.unknown"),`X ${Math.round(r.x)} · Y ${Math.round(r.y)} · Z ${Math.round(r.z)}`);const a=this.missions.current;this.hud.setMission(te(a,"title"),te(a,"desc"),a.progress({ship:e,save:this.save,distToStation:this.distToStation,distToPort:this.distToPort,speedMs:n,scanProgress:this.scan.active?this.scan.progress:0,anomalyDiscovered:this.discoveredAnomaly,docked:this.docked&&this.save.data.dockedCount>0})||0,this.missions.index,this.missions.total,te(a,"hint")||""),this.hud.setFlight({speedMs:n,throttle:Math.abs(e.throttle),boosting:e.boosting,fuel:e.fuel,hull:e.hull,maxSpeed:ae.maxSpeed*An});const o=Math.atan2(e.forward.x,-e.forward.z);this.hud.setSystems({scan:this.scan.active?this.scan.progress:0,dockDist:this.distToPort,nearest:this.nearestName,discoveries:this.save.discoveryCount,total:ys.length,heading:(o*180/Math.PI+360)%360,camMode:this.cameraMode}),this.scanCandidate=this.scan.active?this.scan.target:this._findScanCandidate(),this.hud.setScan(this.scan.active,this.scan.progress,this.scan.target?te(this.scan.target,"name"):"");let l=this.warning;!l&&e.fuel<15&&(l=_t("warn.lowFuel")),!l&&e.heat>.55&&(l=_t("warn.overheat")),!l&&this.warp&&(l=_t("warn.warpCharging")),this.hud.setWarning(l),this.hud.setDanger(this.hazard*.8+(e.hull<30?.25:0)),this._updatePrompt(),this._updateMarkers(),this.mfd.update(t,this._mfdState(),this.quality.mfdHz),this.mfdTexture.needsUpdate=!0,this.hud.setPointerHint(!this.input.pointerLocked&&!this.overlays.active)}_updatePrompt(){if(this.scan.active){this.hud.setPrompt("F",_t("toast.scanRunning"));return}if(this.warp){this.hud.setPrompt("",_t("prompt.warp"));return}if(this.docked){this.hud.setPrompt("R",_t("prompt.undock"));return}if(this.distToPort<kt.dockRadius*3.4){this.ship.speed>3.2?this.hud.setPrompt("X",_t("prompt.slowDown",{limit:Math.round(300/An*An),speed:Math.round(this.ship.speed*An)})):this.hud.setPrompt("R",_t("prompt.dock"));return}if(this.scanCandidate){this.hud.setPrompt("F",_t("toast.scanTarget",{name:te(this.scanCandidate,"name")}));return}this.hud.setPrompt("","")}_updateMarkers(){const t=[],e=this.camera,n=window.innerWidth,s=window.innerHeight,r=(a,o,l,c,h)=>{$t.copy(a).project(e);const u=$t.z>1||$t.z<-1,d=($t.x*.5+.5)*n,p=(-$t.y*.5+.5)*s;t.push({id:o,label:l,dist:c,cls:h,x:d,y:p,visible:!u&&d>-40&&d<n+40&&p>-40&&p<s+40})};this.scanCandidate&&r(this.scanCandidate.position,"scan",te(this.scanCandidate,"name"),this.ship.position.distanceTo(this.scanCandidate.position),"scan"),this.distToPort<900&&r(this.universe.station.portPosition,"dock",_t("hud.berth"),this.distToPort,"dock"),r(Ae.position,"star",_t("marker.star"),this.ship.position.distanceTo(Ae.position),"off");for(const a of Ge)r(a.position,`p-${a.id}`,te(a,"name"),this.ship.position.distanceTo(a.position),"off");this.hud.syncMarkers(t)}_gaugeState(){const t=this.ship,e=new an().setFromQuaternion(t.quaternion,"YXZ"),n=Math.atan2(t.forward.x,-t.forward.z),s=t.velocity.dot(t.up),r=t.velocity.dot(t.right)/Math.max(.4,t.speed);let a=0;for(const o of Ge){const l=t.position.distanceTo(o.position)-o.radius;l<4e3&&(a===0||l<a)&&(a=l)}return{heading:(n*180/Math.PI+360)%360,slip:Math.max(-1,Math.min(1,r)),verticalSpeed:s,altitudeKm:Math.max(0,a)/10,pitch:e.x,roll:e.z}}_mfdState(){const t=this.ship,e=new an().setFromQuaternion(t.quaternion,"YXZ"),n=Math.atan2(t.forward.x,-t.forward.z),s=[],r=(a,o,l,c)=>{$t.copy(a).sub(t.position),!($t.length()>c)&&(si.copy($t).applyQuaternion(pv.copy(t.quaternion).invert()),s.push({x:si.x/c,y:si.z/c,label:o,color:l}))};r(Ae.position,"IRDA","#ffd08a",900);for(const a of Ge)r(a.position,Mc[a.id]||"????","#E9A93D",1400);for(const a of Ar)r(a.position,Mc[a.id]||"????","#B9A6E6",700);r(kt.position,"BEACON","#6FCF97",900);for(const a of Vo)r(a.position,"????","#E2573C",700);return{pitch:e.x,roll:e.z,heading:n,speedMs:t.speed*An,fuel:t.fuel,hull:t.hull,shield:1-this.hazard,region:te(this.universe.regionAt(t.position).region||{},"name")||"—",targetName:this.scanCandidate?te(this.scanCandidate,"name"):this.docked?_t("hud.berth"):"",targetRange:this.scanCandidate?this.ship.position.distanceTo(this.scanCandidate.position):null,scanProgress:this.scan.active?this.scan.progress:0,contacts:s,warning:this.warning||(t.fuel<15?_t("mfd.lowFuel"):""),warp:this.warp?1:0}}_syncSettingsUI(){const t=this.settings,e=document.getElementById("setQuality"),n=document.getElementById("setVolume"),s=document.getElementById("setSens"),r=document.getElementById("setFov"),a=document.getElementById("setInvertY"),o=document.getElementById("setAssist"),l=document.getElementById("setMute");e&&(e.value=t.get("quality"),n.value=String(Math.round(t.get("masterVolume")*100)),document.getElementById("setVolumeOut").value=n.value,s.value=String(Math.round(t.get("sensitivity")*100)),document.getElementById("setSensOut").value=t.get("sensitivity").toFixed(2),r.value=String(t.get("fov")),document.getElementById("setFovOut").value=r.value,a.checked=t.get("invertY"),o.checked=t.get("flightAssist"),l.checked=t.get("muted"),e.onchange=()=>this._applyQuality(e.value),n.oninput=()=>{t.set("masterVolume",n.value/100),this.audio.setVolume(n.value/100),document.getElementById("setVolumeOut").value=n.value},s.oninput=()=>{t.set("sensitivity",s.value/100),document.getElementById("setSensOut").value=(s.value/100).toFixed(2)},r.oninput=()=>{t.set("fov",Number(r.value)),document.getElementById("setFovOut").value=r.value},a.onchange=()=>t.set("invertY",a.checked),o.onchange=()=>t.set("flightAssist",o.checked),l.onchange=()=>{t.set("muted",l.checked),this.audio.setMuted(l.checked)})}async _applyQuality(t){xs[t]&&(this.settings.set("quality",t),this.quality=this.settings.quality,this.renderer.setPixelRatio(this.renderTier==="software"?.75:Math.min(window.devicePixelRatio,this.quality.pixelRatio)),this.composer&&this.composer.setPixelRatio(this.renderTier==="software"?.75:Math.min(window.devicePixelRatio,this.quality.pixelRatio)),this.useComposer=this.quality.bloom&&this.renderTier!=="software",this.overlays.setLoading(_t("load.rebuilding"),.2),this.overlays.el.loading.classList.remove("hidden"),await xo(),this.scene.remove(this.universe.root),this.universe.root.traverse(e=>{if(e.geometry&&e.geometry.dispose(),e.material){const n=Array.isArray(e.material)?e.material:[e.material];for(const s of n)s.map&&s.map.dispose(),s.dispose()}}),this.universe=new vc(this.scene,this.quality),await this.universe.build((e,n)=>this.overlays.setLoading(e,n)),this.scene.remove(this.exterior.group),this.exterior=yc({quality:this.quality}),this.exterior.group.visible=this.cameraMode==="chase",this.scene.add(this.exterior.group),this.overlays.el.loading.classList.add("hidden"),this.overlays.open("pause"),this.hud.toast(_t("toast.quality"),"good"))}_onResize(){const t=window.innerWidth,e=window.innerHeight;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e),this.composer&&this.composer.setSize(t,e)}}ov();function gv(){const i=()=>{const t=ps();document.querySelectorAll("[data-lang]").forEach(e=>{e.setAttribute("aria-pressed",String(e.dataset.lang===t))})};document.addEventListener("click",t=>{const e=t.target.closest("[data-lang]");e&&Mh(e.dataset.lang)}),yh(i),i()}gv();const Sh=new mv;window.__deepSpaceDrifter=Sh;Sh.init().catch(i=>{console.error("[Frostgap Voyager] failed to start",i);const t=document.getElementById("loadText");t&&(t.textContent=`启动失败：${i&&i.message?i.message:i}`,t.style.color="#ff5f6b")});
