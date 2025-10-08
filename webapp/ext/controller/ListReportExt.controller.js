sap.ui.define([], function () {
  "use strict";

  return {
    onListNavigationExtension: function () {
      // Returning false prevents navigation to the object page when a row is pressed.
      return false;
    }
  };
});
