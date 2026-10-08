// Cloudflare Worker: JanchaPass Naver Local Search proxy.
// Required secrets: NAVER_SEARCH_CLIENT_ID, NAVER_SEARCH_CLIENT_SECRET
// Additional runtime secrets for Maps geocoding: NAVER_MAPS_CLIENT_ID, NAVER_MAPS_CLIENT_SECRET\n// Required vars: ALLOWED_ORIGIN = https://jazzolgy.github.io
const json=(body,status=200,origin='')=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...(origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}});
function stripHtml(s){return String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin')||'',allowed=env.ALLOWED_ORIGIN||'https://jazzolgy.github.io';
  if(origin&&origin!==allowed)return json({error:'Forbidden origin'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':allowed,'access-control-allow-methods':'GET, OPTIONS','access-control-allow-headers':'Content-Type','access-control-max-age':'600'}});
  if(url.pathname==='/health')return json({ok:true,searchConfigured:!!(env.NAVER_SEARCH_CLIENT_ID&&env.NAVER_SEARCH_CLIENT_SECRET)},200,allowed);
  if(request.method==='GET'&&(url.pathname==='/api/geocode'||url.pathname==='/api/reverse-geocode')){
   if(!env.NAVER_MAPS_CLIENT_ID||!env.NAVER_MAPS_CLIENT_SECRET)return json({error:'Maps geocoding not configured'},503,allowed);
   const geocode=url.pathname==='/api/geocode';
   const query=(url.searchParams.get('query')||'').trim();
   const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon'));
   if(geocode&&(query.length<2||query.length>150))return json({error:'Invalid address'},400,allowed);
   if(!geocode&&(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<33||lat>39.5||lon<124||lon>132))return json({error:'Invalid coordinates'},400,allowed);
   const base=geocode?'https://maps.apigw.ntruss.com/map-geocode/v2/geocode':'https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc';
   const params=geocode?{query}:{coords:lon+','+lat,orders:'roadaddr,addr',output:'json'};
   try{
    const response=await fetch(base+'?'+new URLSearchParams(params),{headers:{'X-NCP-APIGW-API-KEY-ID':env.NAVER_MAPS_CLIENT_ID,'X-NCP-APIGW-API-KEY':env.NAVER_MAPS_CLIENT_SECRET,'Accept':'application/json'}});
    if(!response.ok)return json({error:'Maps geocoding unavailable',upstreamStatus:response.status},502,allowed);
    const data=await response.json();
    if(geocode){const items=(data.addresses||[]).map(p=>({title:p.roadAddress||p.jibunAddress||query,address:p.jibunAddress||p.roadAddress||'',lat:Number(p.y),lon:Number(p.x)})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));return json({items},200,allowed)}
    const items=(data.results||[]).map(p=>{const reg=p.region||{},land=p.land||{};const region=[reg.area1?.name,reg.area2?.name,reg.area3?.name,reg.area4?.name].filter(Boolean).join(' ');const number=[land.number1,land.number2].filter(Boolean).join('-');return {address:[region,land.name,number].filter(Boolean).join(' '),type:p.name}});
    return json({items},200,allowed);
   }catch{return json({error:'Maps geocoding request failed'},502,allowed)}
  }
  if(url.pathname!=='/api/search'||request.method!=='GET')return json({error:'Not found'},404,allowed);
  const query=(url.searchParams.get('query')||'').trim();
  if(query.length<2||query.length>100)return json({error:'검색어는 2~100자여야 합니다.'},400,allowed);
  if(!env.NAVER_SEARCH_CLIENT_ID||!env.NAVER_SEARCH_CLIENT_SECRET)return json({error:'Search not configured'},503,allowed);
  // NOTE: add Cloudflare WAF / rate limiting before commercial launch.
  try{
   const api='https://naverapihub.apigw.ntruss.com/search/v1/local?'+new URLSearchParams({query,display:'5',start:'1',sort:'random',format:'json'});
   const response=await fetch(api,{headers:{'X-NCP-APIGW-API-KEY-ID':env.NAVER_SEARCH_CLIENT_ID,'X-NCP-APIGW-API-KEY':env.NAVER_SEARCH_CLIENT_SECRET,'Accept':'application/json'}});
   if(!response.ok)return json({error:'Naver search unavailable'},502,allowed);
   const data=await response.json();
   const items=(data.items||[]).map(p=>{
    // Naver local API mapx/mapy: WGS84 geographic degrees * 1e7 (verify against actual results).
    const lon=Number(p.mapx)/1e7,lat=Number(p.mapy)/1e7;
    return {title:stripHtml(p.title),address:p.roadAddress||p.address||'',lat,lon};
   }).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&p.lat>=33&&p.lat<=39.5&&p.lon>=124&&p.lon<=132);
   return json({items},200,allowed);
  }catch{return json({error:'Upstream search failed'},502,allowed)}
 }
};
