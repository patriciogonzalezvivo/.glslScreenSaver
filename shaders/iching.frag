// Author: Patricio Gonzalez Vivo
// Title: Clock

#ifdef GL_ES
precision mediump float;
#endif


uniform sampler2D   u_tex0;

uniform vec4        u_date;
uniform vec2        u_resolution;
uniform float       u_time;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

vec2 ratio(in vec2 st, in vec2 s) {
    return mix( vec2((st.x*s.x/s.y)-(s.x*.5-s.y*.5)/s.y,st.y),
                vec2(st.x,st.y*(s.y/s.x)-(s.y*.5-s.x*.5)/s.x),
                step(s.x,s.y));
}

vec2 scale(vec2 st, vec2 s) {
    return (st-.5)*s+.5;
}

vec2 scale(vec2 st, float s) {
    return scale(st, vec2(s));
}

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
float aastep(float threshold, float value) {
    #ifdef GL_OES_standard_derivatives
    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
    #else
    return step(threshold, value);
    #endif
}

float rectSDF(vec2 st, vec2 s) {
    st = st*2.-1.;
    return max( abs(st.x/s.x),
                abs(st.y/s.y) );
}

float hex(vec2 st, float a, float b, float c, float d, float e, float f){
    st = st*vec2(2.,6.);

    vec2 fpos = fract(st);
    vec2 ipos = floor(st);

    if (ipos.x == 1.0) fpos.x = 1.-fpos.x;
    if (ipos.y < 1.0)
        return mix(rectSDF(fpos, vec2(1.5,1.)),rectSDF(fpos-vec2(0.03,0.),vec2(2., 1.0)),a);
    else if (ipos.y < 2.0)
        return mix(rectSDF(fpos, vec2(1.5,1.)),rectSDF(fpos-vec2(0.03,0.),vec2(2., 1.0)),b);
    else if (ipos.y < 3.0)
        return mix(rectSDF(fpos, vec2(1.5,1.)),rectSDF(fpos-vec2(0.03,0.),vec2(2., 1.0)),c);
    else if (ipos.y < 4.0)
        return mix(rectSDF(fpos, vec2(1.5,1.)),rectSDF(fpos-vec2(0.03,0.),vec2(2., 1.0)),d);
    else if (ipos.y < 5.0)
        return mix(rectSDF(fpos, vec2(1.5,1.)),rectSDF(fpos-vec2(0.03,0.),vec2(2., 1.0)),e);
    else if (ipos.y < 6.0)
        return mix(rectSDF(fpos, vec2(1.5,1.)),rectSDF(fpos-vec2(0.03,0.),vec2(2., 1.0)),f);

    return 0.0;
}

float hex(vec2 st, float N){
    float b[6];
    float remain = floor(mod(N,64.));
    for(int i = 0; i < 6; i++){
        b[i] = 0.0;
        b[i] = step(1.0,mod(remain,2.));
        remain = ceil(remain/2.);
    }
    return hex(st,b[0],b[1],b[2],b[3],b[4],b[5]);
}

float random (in vec2 _st) { 
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

void main() {
    vec3 color = vec3(0.0);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    float pct = min(u_time * 0.1, 1.0);
    color = texture2D(u_tex0, st).rgb * (1.0 - pct);

    float h = floor(u_date.w / 3600.0);
    float m = floor( mod(u_date.w, 3600.0) / 60.0 );
    float time = 0.0;

    st = ratio(st, u_resolution);
    
    vec2 uv = st;
    uv = scale(uv, 5.);
    float df = 1.0;
    df = hex(uv, m);
    color += aastep(df, .5) * aastep(rectSDF(uv, vec2(1.)), .89);

    // color += time * pct;


    gl_FragColor = vec4(color, 1.);
}