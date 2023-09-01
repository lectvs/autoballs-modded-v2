class FlowFilter extends TextureFilter {
    constructor(amount: number, speed: number = 1) {
        super({
            uniforms: { 'float amount': amount, 'float speed': speed },
            code: `
                float vx = 2.0*inp.r - 1.0;
                float vy = 2.0*inp.g - 1.0;
                float v = sqrt(vx*vx + vy*vy) - 0.00277;

                float theta = atan(vy, vx);

                float flow = mod(-theta/PI*8.0 + 1.5*speed*t, 1.0);

                float famt = amount * v;
                outp.rgb = outp.rgb * (1.0 - famt) + vec3(flow, flow, flow) * famt;
            `
        });
    }
}