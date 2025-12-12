(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2894],{69368:function(e,r,t){"use strict";t.d(r,{Z:function(){return M}});var a=t(63366),o=t(87462),n=t(67294),i=t(86010),l=t(94780),s=t(41796),c=t(21964),d=t(82066),u=t(85893),m=(0,d.Z)((0,u.jsx)("path",{d:"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}),"CheckBoxOutlineBlank"),f=(0,d.Z)((0,u.jsx)("path",{d:"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"}),"CheckBox"),b=(0,d.Z)((0,u.jsx)("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"}),"IndeterminateCheckBox"),p=t(98216),v=t(71657),h=t(90948),Z=t(1588),g=t(34867);function x(e){return(0,g.Z)("MuiCheckbox",e)}let y=(0,Z.Z)("MuiCheckbox",["root","checked","disabled","indeterminate","colorPrimary","colorSecondary"]),C=["checkedIcon","color","icon","indeterminate","indeterminateIcon","inputProps","size","className"],w=e=>{let{classes:r,indeterminate:t,color:a}=e,n={root:["root",t&&"indeterminate",`color${(0,p.Z)(a)}`]},i=(0,l.Z)(n,x,r);return(0,o.Z)({},r,i)},k=(0,h.ZP)(c.Z,{shouldForwardProp:e=>(0,h.FO)(e)||"classes"===e,name:"MuiCheckbox",slot:"Root",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.root,t.indeterminate&&r.indeterminate,"default"!==t.color&&r[`color${(0,p.Z)(t.color)}`]]}})(({theme:e,ownerState:r})=>(0,o.Z)({color:(e.vars||e).palette.text.secondary},!r.disableRipple&&{"&:hover":{backgroundColor:e.vars?`rgba(${"default"===r.color?e.vars.palette.action.activeChannel:e.vars.palette.primary.mainChannel} / ${e.vars.palette.action.hoverOpacity})`:(0,s.Fq)("default"===r.color?e.palette.action.active:e.palette[r.color].main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"default"!==r.color&&{[`&.${y.checked}, &.${y.indeterminate}`]:{color:(e.vars||e).palette[r.color].main},[`&.${y.disabled}`]:{color:(e.vars||e).palette.action.disabled}})),I=(0,u.jsx)(f,{}),$=(0,u.jsx)(m,{}),S=(0,u.jsx)(b,{}),P=n.forwardRef(function(e,r){var t,l;let s=(0,v.Z)({props:e,name:"MuiCheckbox"}),{checkedIcon:c=I,color:d="primary",icon:m=$,indeterminate:f=!1,indeterminateIcon:b=S,inputProps:p,size:h="medium",className:Z}=s,g=(0,a.Z)(s,C),x=f?b:m,y=f?b:c,P=(0,o.Z)({},s,{color:d,indeterminate:f,size:h}),M=w(P);return(0,u.jsx)(k,(0,o.Z)({type:"checkbox",inputProps:(0,o.Z)({"data-indeterminate":f},p),icon:n.cloneElement(x,{fontSize:null!=(t=x.props.fontSize)?t:h}),checkedIcon:n.cloneElement(y,{fontSize:null!=(l=y.props.fontSize)?l:h}),ownerState:P,ref:r,className:(0,i.Z)(M.root,Z)},g,{classes:M}))});var M=P},88441:function(e,r,t){"use strict";var a=t(63366),o=t(87462),n=t(67294),i=t(86010),l=t(94780),s=t(70917),c=t(41796),d=t(98216),u=t(2734),m=t(90948),f=t(71657),b=t(28962),p=t(85893);let v=["className","color","value","valueBuffer","variant"],h=e=>e,Z,g,x,y,C,w,k=(0,s.F4)(Z||(Z=h`
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
`)),I=(0,s.F4)(g||(g=h`
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
`)),$=(0,s.F4)(x||(x=h`
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
`)),S=e=>{let{classes:r,variant:t,color:a}=e,o={root:["root",`color${(0,d.Z)(a)}`,t],dashed:["dashed",`dashedColor${(0,d.Z)(a)}`],bar1:["bar",`barColor${(0,d.Z)(a)}`,("indeterminate"===t||"query"===t)&&"bar1Indeterminate","determinate"===t&&"bar1Determinate","buffer"===t&&"bar1Buffer"],bar2:["bar","buffer"!==t&&`barColor${(0,d.Z)(a)}`,"buffer"===t&&`color${(0,d.Z)(a)}`,("indeterminate"===t||"query"===t)&&"bar2Indeterminate","buffer"===t&&"bar2Buffer"]};return(0,l.Z)(o,b.E,r)},P=(e,r)=>"inherit"===r?"currentColor":e.vars?e.vars.palette.LinearProgress[`${r}Bg`]:"light"===e.palette.mode?(0,c.$n)(e.palette[r].main,.62):(0,c._j)(e.palette[r].main,.5),M=(0,m.ZP)("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.root,r[`color${(0,d.Z)(t.color)}`],r[t.variant]]}})(({ownerState:e,theme:r})=>(0,o.Z)({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},backgroundColor:P(r,e.color)},"inherit"===e.color&&"buffer"!==e.variant&&{backgroundColor:"none","&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}},"buffer"===e.variant&&{backgroundColor:"transparent"},"query"===e.variant&&{transform:"rotate(180deg)"})),R=(0,m.ZP)("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.dashed,r[`dashedColor${(0,d.Z)(t.color)}`]]}})(({ownerState:e,theme:r})=>{let t=P(r,e.color);return(0,o.Z)({position:"absolute",marginTop:0,height:"100%",width:"100%"},"inherit"===e.color&&{opacity:.3},{backgroundImage:`radial-gradient(${t} 0%, ${t} 16%, transparent 42%)`,backgroundSize:"10px 10px",backgroundPosition:"0 -23px"})},(0,s.iv)(y||(y=h`
    animation: ${0} 3s infinite linear;
  `),$)),z=(0,m.ZP)("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.bar,r[`barColor${(0,d.Z)(t.color)}`],("indeterminate"===t.variant||"query"===t.variant)&&r.bar1Indeterminate,"determinate"===t.variant&&r.bar1Determinate,"buffer"===t.variant&&r.bar1Buffer]}})(({ownerState:e,theme:r})=>(0,o.Z)({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",backgroundColor:"inherit"===e.color?"currentColor":(r.vars||r).palette[e.color].main},"determinate"===e.variant&&{transition:"transform .4s linear"},"buffer"===e.variant&&{zIndex:1,transition:"transform .4s linear"}),({ownerState:e})=>("indeterminate"===e.variant||"query"===e.variant)&&(0,s.iv)(C||(C=h`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `),k)),j=(0,m.ZP)("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.bar,r[`barColor${(0,d.Z)(t.color)}`],("indeterminate"===t.variant||"query"===t.variant)&&r.bar2Indeterminate,"buffer"===t.variant&&r.bar2Buffer]}})(({ownerState:e,theme:r})=>(0,o.Z)({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left"},"buffer"!==e.variant&&{backgroundColor:"inherit"===e.color?"currentColor":(r.vars||r).palette[e.color].main},"inherit"===e.color&&{opacity:.3},"buffer"===e.variant&&{backgroundColor:P(r,e.color),transition:"transform .4s linear"}),({ownerState:e})=>("indeterminate"===e.variant||"query"===e.variant)&&(0,s.iv)(w||(w=h`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `),I)),B=n.forwardRef(function(e,r){let t=(0,f.Z)({props:e,name:"MuiLinearProgress"}),{className:n,color:l="primary",value:s,valueBuffer:c,variant:d="indeterminate"}=t,m=(0,a.Z)(t,v),b=(0,o.Z)({},t,{color:l,variant:d}),h=S(b),Z=(0,u.Z)(),g={},x={bar1:{},bar2:{}};if(("determinate"===d||"buffer"===d)&&void 0!==s){g["aria-valuenow"]=Math.round(s),g["aria-valuemin"]=0,g["aria-valuemax"]=100;let e=s-100;"rtl"===Z.direction&&(e=-e),x.bar1.transform=`translateX(${e}%)`}if("buffer"===d&&void 0!==c){let e=(c||0)-100;"rtl"===Z.direction&&(e=-e),x.bar2.transform=`translateX(${e}%)`}return(0,p.jsxs)(M,(0,o.Z)({className:(0,i.Z)(h.root,n),ownerState:b,role:"progressbar"},g,{ref:r},m,{children:["buffer"===d?(0,p.jsx)(R,{className:h.dashed,ownerState:b}):null,(0,p.jsx)(z,{className:h.bar1,ownerState:b,style:x.bar1}),"determinate"===d?null:(0,p.jsx)(j,{className:h.bar2,ownerState:b,style:x.bar2})]}))});r.Z=B},28962:function(e,r,t){"use strict";t.d(r,{E:function(){return n}});var a=t(1588),o=t(34867);function n(e){return(0,o.Z)("MuiLinearProgress",e)}let i=(0,a.Z)("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);r.Z=i},18987:function(e,r,t){"use strict";t.d(r,{Z:function(){return g}});var a=t(63366),o=t(87462),n=t(67294),i=t(86010),l=t(94780),s=t(59773),c=t(90948),d=t(71657),u=t(1588),m=t(34867);function f(e){return(0,m.Z)("MuiListItemAvatar",e)}(0,u.Z)("MuiListItemAvatar",["root","alignItemsFlexStart"]);var b=t(85893);let p=["className"],v=e=>{let{alignItems:r,classes:t}=e;return(0,l.Z)({root:["root","flex-start"===r&&"alignItemsFlexStart"]},f,t)},h=(0,c.ZP)("div",{name:"MuiListItemAvatar",slot:"Root",overridesResolver:(e,r)=>{let{ownerState:t}=e;return[r.root,"flex-start"===t.alignItems&&r.alignItemsFlexStart]}})(({ownerState:e})=>(0,o.Z)({minWidth:56,flexShrink:0},"flex-start"===e.alignItems&&{marginTop:8})),Z=n.forwardRef(function(e,r){let t=(0,d.Z)({props:e,name:"MuiListItemAvatar"}),{className:l}=t,c=(0,a.Z)(t,p),u=n.useContext(s.Z),m=(0,o.Z)({},t,{alignItems:u.alignItems}),f=v(m);return(0,b.jsx)(h,(0,o.Z)({className:(0,i.Z)(f.root,l),ownerState:m,ref:r},c))});var g=Z},66485:function(e){function r(){return new DOMException("The request is not allowed","NotAllowedError")}async function t(e){if(!navigator.clipboard)throw r();return navigator.clipboard.writeText(e)}async function a(e){let t=document.createElement("span");t.textContent=e,t.style.whiteSpace="pre",t.style.webkitUserSelect="auto",t.style.userSelect="all",document.body.appendChild(t);let a=window.getSelection(),o=window.document.createRange();a.removeAllRanges(),o.selectNode(t),a.addRange(o);let n=!1;try{n=window.document.execCommand("copy")}finally{a.removeAllRanges(),window.document.body.removeChild(t)}if(!n)throw r()}async function o(e){try{await t(e)}catch(t){try{await a(e)}catch(e){throw e||t||r()}}}/*! clipboard-copy. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */e.exports=o}}]);