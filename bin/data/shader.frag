#version 430
//TODO: maybe use global unforms from OF like:
//uniform mat4 modelViewMatrix; 
//instead of matview and matproj so we dont have to pass them?
//check vertex shader for code, but that might entitle the shader.begin being inside cam.begin?
//this probably is a shit idea but maybe would be more optimized, although matview matrix would have to be inverted in shader rather than cpu
uniform mat4 matView;
uniform mat4 matProj;
uniform vec2 resolution;
uniform vec2 nearFarPlane;
uniform vec3 camPos;
uniform float time;
out vec4 outputColor;
float bo(vec3 p,vec3 r) {p=abs(p)-r;return max(max(p.x,p.y),p.z);}
vec2 s,e=vec2(.00035,-.00035);float t,tt;vec3 np;
mat2 r2(float r){return mat2(cos(r),sin(r),-sin(r),cos(r));}
vec2 mp( vec3 p )
{
    vec2 t=vec2(bo(p,vec3(12,12,12)),4);
    return t;
}
vec2 tr( vec3 ro, vec3 rd )
{
	vec2 h,t=vec2(nearFarPlane.x);
	for(int i=0;i<128;i++){
		h=mp(ro+rd*t.x);
		if(h.x<.0001||t.x>nearFarPlane.y) break;
		t.x+=h.x;t.y=h.y;
	}
	if(t.x>nearFarPlane.y) t.x=0;  return t;
}
vec3 UVtoEYE(vec2 UV){ return normalize((vec4((vec4(UV,0,1)*matProj).xy,1,0)*matView).xyz);}
void main(void)
{
	tt=mod(time,100);
	vec2 uv=(vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y)*2-1)*vec2(-1,1);
	vec3 ro=(vec4(camPos,1)*matView).xyz,
	rd=UVtoEYE(uv),
	co,fo,ld=normalize(vec3(-.5,0.5,0.1));
	co=fo=vec3(1,.5,.2)-rd.y*.4;
	s=tr(ro,rd);t=s.x;
	if(t>0){
		vec3 po=ro+rd*t,no=normalize(e.xyy*mp(po+e.xyy).x+
		e.yyx*mp(po+e.yyx).x+
		e.yxy*mp(po+e.yxy).x+
		e.xxx*mp(po+e.xxx).x), al=vec3(1,.5,0);
		if(s.y<5)  al=vec3(0);
		if(s.y>5)  al=vec3(1);
		float dif=max(0,dot(no,ld)),
		aor=t/50,
		ao=exp2(2-pow(max(0,1-mp(po+no*aor).x/aor),2)),
		spo=10;
		float fr=pow(1+dot(no,rd),4),
		sss=smoothstep(0,1,mp(po+ld*.4).x/.4),
		sp=pow(max(dot(reflect(-ld,no),-rd),0),spo);
		co=mix(sp+al*ao*(dif+sss),fo,min(fr,.5));
	  }
	co=mix(co,fo,1-exp(-.0000001*t*t*t));
	outputColor = vec4(pow(co,vec3(.45)),1);
}