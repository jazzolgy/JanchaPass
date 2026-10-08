// Cloudflare Worker: JanchaPass Naver Local Search proxy.
// Required secrets: NAVER_SEARCH_CLIENT_ID, NAVER_SEARCH_CLIENT_SECRET
// Required vars: ALLOWED_ORIGIN = https://jazzolgy.github.io
const json=(body,status=200,origin='')=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...(origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}});
function stripHtml(s){return String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin')||'',allowed=env.ALLOWED_ORIGIN||'https://jazzolgy.github.io';
  if(origin&&origin!==allowed)return json({error:'Forbidden origin'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':allowed,'access-control-allow-methods':'GET, OPTIONS','access-control-allow-headers':'Content-Type','access-control-max-age':'600'}});
  if(url.pathname==='/health')return json({ok:true,searchConfigured:!!(env.NAVER_SEARCH_CLIENT_ID&&env.NAVER_SEARCH_CLIENT_SECRET)},200,allowed);
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
