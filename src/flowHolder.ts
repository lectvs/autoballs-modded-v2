class FlowHolder extends WorldObject {
    flowTexture: BasicTexture;
    flow: Flow.Vectors;

    constructor(flowTexture: BasicTexture) {
        super();
        this.flowTexture = flowTexture;
        this.flow = Flow.getVectors(flowTexture);
    }
}