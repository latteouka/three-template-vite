#include ../glsl/snoise2d.glsl

uniform vec3 uColor;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uNoiseFactor;

varying vec3 vUv;
varying vec3 vNormal;
varying vec3 vSurfaceToLight;


vec3 light_reflection(vec3 lightColor) {
  // ambient light is just light's color
  vec3 ambient = lightColor;

  // diffuse calculation
  // dot product of surface dir and normal
  // https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-point.html
  vec3 diffuse = lightColor * dot(vSurfaceToLight, vNormal);

  return (ambient + diffuse);
}

void main() {
  // final projection on the viewport / factor 
  // ex: (0.5, 0.5 -> 799.5, 599.5)
  // https://computergraphics.stackexchange.com/questions/5724/glsl-can-someone-explain-why-gl-fragcoord-xy-screensize-is-performed-and-for
  // vec2 uv = gl_FragCoord.xy is basically a pixel pattern(a noise block) repeat 'resolution' times.
  // devide it will make "single" noise block to be bigger
  vec2 uv = gl_FragCoord.xy / uNoiseFactor;

  // calculate total light strength
  vec3 light_value  = light_reflection(uLightColor);

  // calculate noise based on uv
  // * 0.5 add more contrast (because some of them are already bigger than 1)
  // + 0.5 brighter (let every noise block brighter)
  vec3 noiseColors = vec3(snoise(uv)* 0.5 + 0.5);

  // * intensity
  light_value *= uLightIntensity;

  // the most important part
  // power by light_value(bright or dark)
  // the number will change the contrast significantly
  noiseColors *= pow(light_value.r, 5.0);

  // gl_FragColor = vec4(noiseColors, 1.0);
  gl_FragColor.r = max(noiseColors.r, uColor.r);
  gl_FragColor.g = max(noiseColors.g, uColor.g);
  gl_FragColor.b = max(noiseColors.b, uColor.b);
  gl_FragColor.a = 1.0;
}
