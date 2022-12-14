function getIsReactActEnvironment() {
  return global.IS_REACT_ACT_ENVIRONMENT;
}

function setReactActEnvironment(isReactActEnvironment) {
  global.IS_REACT_ACT_ENVIRONMENT = isReactActEnvironment;
}

if (typeof beforeAll === "function" && typeof afterAll === "function") {
  let previousIsReactActEnvironment = getIsReactActEnvironment();

  beforeAll(() => {
    previousIsReactActEnvironment = getIsReactActEnvironment();
    setReactActEnvironment(true);
  });

  afterAll(() => {
    setReactActEnvironment(previousIsReactActEnvironment);
  });
}
