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

float digits(in vec2 st, in vec2 size, in float value, in float nDecDigit) {
    st /= size;

    float absValue = abs(value);
    float biggestDigitIndex = max(floor(log2(absValue) / log2(10.)), 0.);

    float nIntDigits = 0.;
    float counter = floor(value);
    for (int i = 0; i < 9; i++) {
        counter = floor(counter*.1);
        nIntDigits++;
        if (counter == 0.) {
            break;
        }
    }

    vec2 pos = vec2(fract(st.x), st.y);

    float digit = 12.;
    float digitIndex = (nIntDigits-1.) - floor(st.x);
    if (digitIndex > (-nDecDigit - 1.5)) {
        if (digitIndex > biggestDigitIndex) {
            if (value < 0.) {
                if (digitIndex < (biggestDigitIndex+1.5))
                    digit = 11.;
            }

        } else {
            
            if (digitIndex == -1.) {
                if (nDecDigit > 0.)
                    digit = 10.;
            } else {
                if (digitIndex < 0.) 
                    digitIndex += 1.;

                float digitValue = (absValue / (pow(10., digitIndex)));
                digit = mod(floor(0.0001+digitValue), 10.);
            }
        }
    }

    if (pos.x < 0.) return 0.;
    if (pos.y < 0.) return 0.;
    if (pos.x >= 1.) return 0.;
    if (pos.y >= 1.) return 0.;

    // make a 4x5 array of bits
    float bin = 0.;
    if(digit < 0.5) // 0
        bin = 7. + 5. * 16. + 5. * 256. + 5. * 4096. + 7. * 65536.;
    else if(digit < 1.5) // 1
        bin = 2. + 2. * 16. + 2. * 256. + 2. * 4096. + 2. * 65536.;
    else if(digit < 2.5) // 2
        bin = 7. + 1. * 16. + 7. * 256. + 4. * 4096. + 7. * 65536.;
    else if(digit < 3.5) // 3
        bin = 7. + 4. * 16. + 7. * 256. + 4. * 4096. + 7. * 65536.;
    else if(digit < 4.5) // 4
        bin = 4. + 7. * 16. + 5. * 256. + 1. * 4096. + 1. * 65536.;
    else if(digit < 5.5) // 5
        bin = 7. + 4. * 16. + 7. * 256. + 1. * 4096. + 7. * 65536.;
    else if(digit < 6.5) // 6
        bin = 7. + 5. * 16. + 7. * 256. + 1. * 4096. + 7. * 65536.;
    else if(digit < 7.5) // 7
        bin = 4. + 4. * 16. + 4. * 256. + 4. * 4096. + 7. * 65536.;
    else if(digit < 8.5) // 8
        bin = 7. + 5. * 16. + 7. * 256. + 5. * 4096. + 7. * 65536.;
    else if(digit < 9.5) // 9
        bin = 7. + 4. * 16. + 7. * 256. + 5. * 4096. + 7. * 65536.;
    else if(digit < 10.5) // '.'
        bin = 2. + 0. * 16. + 0. * 256. + 0. * 4096. + 0. * 65536.;
    else if(digit < 11.5) // '-'
        bin = 0. + 0. * 16. + 7. * 256. + 0. * 4096. + 0. * 65536.;
    
    vec2 pixel = floor(pos * vec2(4., 5.));
    return mod(floor(bin / pow(2., (pixel.x + (pixel.y * 4.)))), 2.);
}

void main() {
    vec3 color = vec3(1.0);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    vec3 org = texture2D(u_tex0, st).rgb;

    st.x *= u_resolution.x/u_resolution.y;

    // Grid
    // vec2 grid = vec2(100.0,50.);
    // st *= grid;
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

    float rnd = random(floor(st+vel));

    vec2 fpos = fract(st+vel);

    color *= digits(fpos, vec2(0.8), rnd * 9.0, 0.);
    color = smoothstep(0.,0.5 + sin(ipos.x * 0.012 + u_time) * 0.25,color*color); // smooth
    color *= step(0.3, random(rnd)); // threshold

    float pct = min(u_time * 0.1 + color.r, 1.0);
    color = mix(org, color, pct);

    gl_FragColor = vec4(color,1.0);
}