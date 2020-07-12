// Author: Patricio Gonzalez Vivo
// Title: Clock

#ifdef GL_ES
precision mediump float;
#endif


uniform sampler2D   u_tex0;
uniform vec4        u_date;
uniform vec2        u_resolution;
uniform float       u_time;

#define PI  3.141592653589793238462643383279
#define TAU 6.283185307179586476925286766559

mat2 rotate2d (in float angle) {
    return mat2(cos(angle), -sin(angle),
                sin(angle), cos(angle));
}

float box (in vec2 st, in vec2 size) {
    size = vec2(0.5) - size*0.5;
    vec2 uv = smoothstep(size, size+vec2(0.001), st);
    uv *= smoothstep(size, size+vec2(0.001), vec2(1.0)-st);
    return uv.x*uv.y;
}

float pulse(float c, float w, float x ){
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

vec3 getHMS (float sec) {
    return vec3(mod(sec,43200.)/43200.,
                mod(sec,3600.)/3600.,
                mod(sec,60.)/60.);
}

void main() {
    vec3 color = vec3(0.);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    color += texture2D(u_tex0, st).rgb * (1.0 - min(u_time * 0.1, 1.0));

    st = (st-.5)*1.5+.5;
    if (u_resolution.y > u_resolution.x ) {
        st.y *= u_resolution.y/u_resolution.x;
        st.y -= (u_resolution.y*.5-u_resolution.x*.5)/u_resolution.x;
    } else {
        st.x *= u_resolution.x/u_resolution.y;
        st.x -= (u_resolution.x*.5-u_resolution.y*.5)/u_resolution.y;
    }
    
    
    float lenght_h = 0.388;
    float lenght_m = .5;
    float lenght_s = .5;
    
    vec3 hms = getHMS(-u_date.w);
    
    st -= .5;
    vec2 st_h = rotate2d(hms.x*TAU) * st;
    vec2 st_m = rotate2d(hms.y*TAU) * st;
    vec2 st_s = rotate2d(hms.z*TAU) * st;
    
    color += vec3(1.,0.,0.)*box(st_s+.5-vec2(0.,lenght_s*.5), vec2(0.005,lenght_s));
    color += vec3(1.)*box(st_m+.5-vec2(0.,lenght_m*.5), vec2(0.02,lenght_m));
    color += vec3(1.)*box(st_h+.5-vec2(0.,lenght_h*.5), vec2(0.03,lenght_h));

    float df = dot(st,st)*2.;
    color += smoothstep(0.400,0.552,pulse(0.620,.05,df));
    color += smoothstep(0.998,.9981,1.-df);
    
    gl_FragColor = vec4(color,1.0);
}