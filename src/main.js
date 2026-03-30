function doGet(e) {
  const template = HtmlService.createTemplateFromFile('ui/index');
  template.initialRoute = (e && e.parameter && e.parameter.page) || 'dashboard';
  template.initialParams = JSON.stringify((e && e.parameter) || {});

  return template.evaluate()
    .setTitle('Knowledge Base')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
