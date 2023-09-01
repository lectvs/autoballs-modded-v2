namespace Flow {
    export type Vectors = Vector2[][];

    export function GET_FIXED_FLOW_TEXTURE() {
        return Texture.filledRect(global.gameWidth, global.gameHeight, 0x808080)
                      .transform({ filters: [new GenFilter()] }, 'Flow.GET_FIXED_FLOW_TEXTURE');
    }

    export function getVectors(texture: BasicTexture) {
        let pixels = Main.renderer.plugins.extract.pixels(texture.renderTextureSprite.renderTexture);

        let result: Vector2[][] = [];
        for (let y = 0; y < texture.height; y++) {
            let line: Vector2[] = [];
            for (let x = 0; x < texture.width; x++) {
                let i = x + y * texture.width;
                let r = pixels[4*i + 0];
                let g = pixels[4*i + 1];

                let haxis = r === 128 ? 0 : 2*r/255 - 1;
                let vaxis = g === 128 ? 0 : 2*g/255 - 1;

                line.push(vec2(haxis, vaxis));
            }
            result.push(line);
        }

        return result;
    }
}