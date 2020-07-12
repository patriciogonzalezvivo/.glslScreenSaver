// Author: Patricio Gonzalez Vivo
// Title: Clock

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_buffer0;
uniform sampler2D   u_buffer1;

uniform sampler2D   u_tex0;

uniform vec4        u_date;
uniform vec2        u_resolution;
uniform float       u_time;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

#define ITERATIONS 9

float diffU = 0.25;
float diffV = 0.05;
float f = 0.1;
float k = 0.063;

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

float random (in float x) {
    return fract(sin(x)*43758.5453123);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
    vec3 color = vec3(0.0);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

     #ifdef BUFFER_0
    // PING BUFFER
    //
    //  Note: Here is where most of the action happens. But need's to read
    //  te content of the previous pass, for that we are making another buffer
    //  BUFFER_1 (u_buffer1)
    vec2 pixel = 1./u_resolution;
    float h = floor(u_date.w * 0.000277778);
    float m = floor( mod(u_date.w, 3600.0) * 0.016666667);

    pixel *= 1. + mod(m,4.) * 0.25; 

    float kernel[9];
    kernel[0] = 0.707106781;
    kernel[1] = 1.0;
    kernel[2] = 0.707106781;
    kernel[3] = 1.0;
    kernel[4] = -6.82842712;
    kernel[5] = 1.0;
    kernel[6] = 0.707106781;
    kernel[7] = 1.0;
    kernel[8] = 0.707106781;

    vec2 offset[9];
    offset[0] = pixel * vec2(-1.0,-1.0);
    offset[1] = pixel * vec2( 0.0,-1.0);
    offset[2] = pixel * vec2( 1.0,-1.0);

    offset[3] = pixel * vec2(-1.0,0.0);
    offset[4] = pixel * vec2( 0.0,0.0);
    offset[5] = pixel * vec2( 1.0,0.0);

    offset[6] = pixel * vec2(-1.0,1.0);
    offset[7] = pixel * vec2( 0.0,1.0);
    offset[8] = pixel * vec2( 1.0,1.0);

    vec2 texColor = texture2D(u_buffer1, st).rb;

    vec2 uv = st;
    uv = ratio(uv, u_resolution);
    uv = scale(uv, 2.5 + sin(u_time * 0.001) * 0.5);
    float df = 1.0;
    df = hex(uv, m);
    float time = step(df, .5) * step(rectSDF(uv, vec2(1.)), .89);
    float pct = random(u_time * 0.1 + (uv.x * 0.1) + (uv.y * 0.2));
    float srcTexColor = time * pct;

    vec2 lap = vec2(0.0);

    for (int i=0; i < ITERATIONS; i++){
        vec2 tmp = texture2D(u_buffer1, st + offset[i]).rb;
        lap += tmp * kernel[i];
    }

    float F  = f + srcTexColor * (0.02 + m * 0.005) - 0.0005;
    float K  = k + srcTexColor * 0.025 - 0.0005;

    float u  = texColor.r;
    float v  = texColor.g + srcTexColor * 0.5;

    float uvv = u * v * v;

    float du = diffU * lap.r - uvv + F * (1.0 - u);
    float dv = diffV * lap.g + uvv - (F + K) * v;

    u += du * 0.6;
    v += dv * 0.6;

    color = vec3(clamp( u, 0.0, 1.0 ), 1.0 - u/v ,clamp( v, 0.0, 1.0 ));

#elif defined( BUFFER_1 )
    color = texture2D(u_buffer0, st).rgb;
#else

    // Main Buffer
    float pct = min(u_time * 0.1, 1.0);
    color = texture2D(u_tex0, st).rgb * (1.0 - pct);

    color += smoothstep(0.1, .5, texture2D(u_buffer1, st).b);
#endif

    gl_FragColor = vec4(color, 1.);
}