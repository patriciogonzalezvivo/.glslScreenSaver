// Copyright (c) 2015 Patricio Gonzalez Vivo

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec4        u_date;
uniform vec2        u_resolution;

uniform float       u_time;

float random (in float x) { return fract(sin(x)*1e4); }
float random (in vec2 _st) { return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))* 43758.5453123);}

void main() {
    vec3 color = vec3(1.0);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    vec3 org = texture2D(u_tex0, st).rgb;

    st.x *= u_resolution.x/u_resolution.y;

    // Grid
    float h = floor(u_date.w / 3600.0);
    float m = floor( mod(u_date.w, 3600.0) / 60.0 );
    vec2 grid = vec2(10.0 * clamp(m + h, 5., 10.), 4.5 * clamp(m, 5., 10.));
    st *= grid;

    vec2 ipos = floor(st);  // integer

    vec2 vel = floor(vec2(u_time*10.)); // time
    vel *= vec2(-1.,0.); // direction

    vel *= (step(1., mod(ipos.y,2.0))-0.5)*2.; // Oposite directions
    vel *= random(ipos.y); // random speed

    // 100%
    float totalCells = grid.x*grid.y;
    float t = mod(u_time*max(grid.x,grid.y)+floor(1.0+u_time),totalCells);
    vec2 head = vec2(mod(t,grid.x), floor(t/grid.x));

    vec2 offset = vec2(0.1,0.);

    color *= step(grid.y-head.y,ipos.y);                                // Y
    color += (1.0-step(head.x,ipos.x))*step(grid.y-head.y,ipos.y+1.);   // X
    color = clamp(color,vec3(0.),vec3(1.));

    // Assign a random value base on the integer coord
    color.r *= random(floor(st+vel+offset));
    color.g *= random(floor(st+vel));
    color.b *= random(floor(st+vel-offset));

    vec2 fpos = fract(st+vel);

    color = smoothstep(0.,0.5, color*color); // smooth
    color = step(0.5 ,color); // threshold

    //  Margin
    color *= step(.1,fract(st.x+vel.x))*step(.1,fract(st.y+vel.y));

    float pct = min(u_time * 0.1 + color.r, 1.0);
    color = mix(org, color, pct);

    gl_FragColor = vec4(color,1.0);
}