(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2201],{88441:function(e,r,t){"use strict";var a=t(63366),o=t(87462),n=t(67294),i=t(86010),l=t(94780),s=t(70917),c=t(41796),u=t(98216),d=t(2734),f=t(90948),b=t(71657),m=t(28962),p=t(85893);let v=["className","color","value","valueBuffer","variant"],h=e=>e,g,y,Z,w,k,C,x=(0,s.F4)(g||(g=h`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`)),$=(0,s.F4)(y||(y=h`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`)),P=(0,s.F4)(Z||(Z=h`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`)),S=e=>{let{classes:r,variant:t,color:a}=e,o={root:["root",`color${(0,u.Z)(a)}`,t],dashed:["dashed",`dashedColor${(0,u.Z)(a)}`],bar1:["bar",`barColor${(0,u.Z)(a)}`,("indeterminate"===t||"query"===t)&&"bar1Indeterminate","determinate"===t&&"bar1Determinate","buffer"===t&&"bar1Buffer"],bar2:["bar","buffer"!==t&&`barColor${(0,u.Z)(a)}`,"buffer"===t&&`color${(0,u.Z)(a)}`,("indeterminate"===t||"query"===t)&&"bar2Indeterminate","buffer"===t&&"bar2Buffer"]};return(0,l.Z)(o,m.E,r)},R=(e,r)=>"inherit"===r?"currentColor":e.vars?e.vars.palette.LinearProgress[`${r}Bg`]:"light"===e.palette.mode?(0,c.$n)(e.palette[r].main,.62):(0,c._j)(e.palette[r].main,.5),M=(0,f.ZP)("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.root,r[`color${(0,u.Z)(t.color)}`],r[t.variant]]}})(({ownerState:e,theme:r})=>(0,o.Z)({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},backgroundColor:R(r,e.color)},"inherit"===e.color&&"buffer"!==e.variant&&{backgroundColor:"none","&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}},"buffer"===e.variant&&{backgroundColor:"transparent"},"query"===e.variant&&{transform:"rotate(180deg)"})),B=(0,f.ZP)("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.dashed,r[`dashedColor${(0,u.Z)(t.color)}`]]}})(({ownerState:e,theme:r})=>{let t=R(r,e.color);return(0,o.Z)({position:"absolute",marginTop:0,height:"100%",width:"100%"},"inherit"===e.color&&{opacity:.3},{backgroundImage:`radial-gradient(${t} 0%, ${t} 16%, transparent 42%)`,backgroundSize:"10px 10px",backgroundPosition:"0 -23px"})},(0,s.iv)(w||(w=h`
    animation: ${0} 3s infinite linear;
  `),P)),N=(0,f.ZP)("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.bar,r[`barColor${(0,u.Z)(t.color)}`],("indeterminate"===t.variant||"query"===t.variant)&&r.bar1Indeterminate,"determinate"===t.variant&&r.bar1Determinate,"buffer"===t.variant&&r.bar1Buffer]}})(({ownerState:e,theme:r})=>(0,o.Z)({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",backgroundColor:"inherit"===e.color?"currentColor":(r.vars||r).palette[e.color].main},"determinate"===e.variant&&{transition:"transform .4s linear"},"buffer"===e.variant&&{zIndex:1,transition:"transform .4s linear"}),({ownerState:e})=>("indeterminate"===e.variant||"query"===e.variant)&&(0,s.iv)(k||(k=h`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `),x)),j=(0,f.ZP)("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.bar,r[`barColor${(0,u.Z)(t.color)}`],("indeterminate"===t.variant||"query"===t.variant)&&r.bar2Indeterminate,"buffer"===t.variant&&r.bar2Buffer]}})(({ownerState:e,theme:r})=>(0,o.Z)({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left"},"buffer"!==e.variant&&{backgroundColor:"inherit"===e.color?"currentColor":(r.vars||r).palette[e.color].main},"inherit"===e.color&&{opacity:.3},"buffer"===e.variant&&{backgroundColor:R(r,e.color),transition:"transform .4s linear"}),({ownerState:e})=>("indeterminate"===e.variant||"query"===e.variant)&&(0,s.iv)(C||(C=h`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `),$)),q=n.forwardRef(function(e,r){let t=(0,b.Z)({props:e,name:"MuiLinearProgress"}),{className:n,color:l="primary",value:s,valueBuffer:c,variant:u="indeterminate"}=t,f=(0,a.Z)(t,v),m=(0,o.Z)({},t,{color:l,variant:u}),h=S(m),g=(0,d.Z)(),y={},Z={bar1:{},bar2:{}};if(("determinate"===u||"buffer"===u)&&void 0!==s){y["aria-valuenow"]=Math.round(s),y["aria-valuemin"]=0,y["aria-valuemax"]=100;let e=s-100;"rtl"===g.direction&&(e=-e),Z.bar1.transform=`translateX(${e}%)`}if("buffer"===u&&void 0!==c){let e=(c||0)-100;"rtl"===g.direction&&(e=-e),Z.bar2.transform=`translateX(${e}%)`}return(0,p.jsxs)(M,(0,o.Z)({className:(0,i.Z)(h.root,n),ownerState:m,role:"progressbar"},y,{ref:r},f,{children:["buffer"===u?(0,p.jsx)(B,{className:h.dashed,ownerState:m}):null,(0,p.jsx)(N,{className:h.bar1,ownerState:m,style:Z.bar1}),"determinate"===u?null:(0,p.jsx)(j,{className:h.bar2,ownerState:m,style:Z.bar2})]}))});r.Z=q},28962:function(e,r,t){"use strict";t.d(r,{E:function(){return n}});var a=t(1588),o=t(34867);function n(e){return(0,o.Z)("MuiLinearProgress",e)}let i=(0,a.Z)("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);r.Z=i},51233:function(e,r,t){"use strict";t.d(r,{Z:function(){return P}});var a=t(63366),o=t(87462),n=t(67294),i=t(86010),l=t(59766),s=t(94780),c=t(34867),u=t(13264),d=t(29628),f=t(39707),b=t(66500),m=t(95408),p=t(98700),v=t(85893);let h=["component","direction","spacing","divider","children","className","useFlexGap"],g=(0,b.Z)(),y=(0,u.Z)("div",{name:"MuiStack",slot:"Root",overridesResolver:(e,r)=>r.root});function Z(e){return(0,d.Z)({props:e,name:"MuiStack",defaultTheme:g})}let w=e=>({row:"Left","row-reverse":"Right",column:"Top","column-reverse":"Bottom"})[e],k=({ownerState:e,theme:r})=>{let t=(0,o.Z)({display:"flex",flexDirection:"column"},(0,m.k9)({theme:r},(0,m.P$)({values:e.direction,breakpoints:r.breakpoints.values}),e=>({flexDirection:e})));if(e.spacing){let a=(0,p.hB)(r),o=Object.keys(r.breakpoints.values).reduce((r,t)=>(("object"==typeof e.spacing&&null!=e.spacing[t]||"object"==typeof e.direction&&null!=e.direction[t])&&(r[t]=!0),r),{}),n=(0,m.P$)({values:e.direction,base:o}),i=(0,m.P$)({values:e.spacing,base:o});"object"==typeof n&&Object.keys(n).forEach((e,r,t)=>{let a=n[e];if(!a){let a=r>0?n[t[r-1]]:"column";n[e]=a}});let s=(r,t)=>e.useFlexGap?{gap:(0,p.NA)(a,r)}:{"& > :not(style) + :not(style)":{margin:0,[`margin${w(t?n[t]:e.direction)}`]:(0,p.NA)(a,r)}};t=(0,l.Z)(t,(0,m.k9)({theme:r},i,s))}return(0,m.dt)(r.breakpoints,t)};var C=t(90948),x=t(71657);let $=function(e={}){let{createStyledComponent:r=y,useThemeProps:t=Z,componentName:l="MuiStack"}=e,u=()=>(0,s.Z)({root:["root"]},e=>(0,c.Z)(l,e),{}),d=r(k),b=n.forwardRef(function(e,r){let l=t(e),s=(0,f.Z)(l),{component:c="div",direction:b="column",spacing:m=0,divider:p,children:g,className:y,useFlexGap:Z=!1}=s,w=(0,a.Z)(s,h),k=u();return(0,v.jsx)(d,(0,o.Z)({as:c,ownerState:{direction:b,spacing:m,useFlexGap:Z},ref:r,className:(0,i.Z)(k.root,y)},w,{children:p?function(e,r){let t=n.Children.toArray(e).filter(Boolean);return t.reduce((e,a,o)=>(e.push(a),o<t.length-1&&e.push(n.cloneElement(r,{key:`separator-${o}`})),e),[])}(g,p):g}))});return b}({createStyledComponent:(0,C.ZP)("div",{name:"MuiStack",slot:"Root",overridesResolver:(e,r)=>r.root}),useThemeProps:e=>(0,x.Z)({props:e,name:"MuiStack"})});var P=$},13264:function(e,r,t){"use strict";var a=t(70182);let o=(0,a.ZP)();r.Z=o},66485:function(e){function r(){return new DOMException("The request is not allowed","NotAllowedError")}async function t(e){if(!navigator.clipboard)throw r();return navigator.clipboard.writeText(e)}async function a(e){let t=document.createElement("span");t.textContent=e,t.style.whiteSpace="pre",t.style.webkitUserSelect="auto",t.style.userSelect="all",document.body.appendChild(t);let a=window.getSelection(),o=window.document.createRange();a.removeAllRanges(),o.selectNode(t),a.addRange(o);let n=!1;try{n=window.document.execCommand("copy")}finally{a.removeAllRanges(),window.document.body.removeChild(t)}if(!n)throw r()}async function o(e){try{await t(e)}catch(t){try{await a(e)}catch(e){throw e||t||r()}}}/*! clipboard-copy. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */e.exports=o}}]);