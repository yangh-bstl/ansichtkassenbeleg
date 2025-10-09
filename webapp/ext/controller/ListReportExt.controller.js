sap.ui.define([
  "sap/ui/core/mvc/ControllerExtension",
  "sap/m/Text"
], function (ControllerExtension, Text) {
  "use strict";

  function createTextFromLink(oLink) {
    var oText = new Text({
      wrapping: false
    });

    var oTextBindingInfo = oLink.getBindingInfo && oLink.getBindingInfo("text");
    if (oTextBindingInfo) {
      oText.bindProperty("text", oTextBindingInfo);
    } else if (typeof oLink.getText === "function") {
      oText.setText(oLink.getText());
    }

    var oTooltipBindingInfo = oLink.getBindingInfo && oLink.getBindingInfo("tooltip");
    if (oTooltipBindingInfo) {
      oText.bindProperty("tooltip", oTooltipBindingInfo);
    } else if (typeof oLink.getTooltip === "function") {
      oText.setTooltip(oLink.getTooltip());
    }

    return oText;
  }

  function convertResponsiveTableLinksToText(oTable) {
    var oItemsBindingInfo = oTable.getBindingInfo("items");
    if (!oItemsBindingInfo || !oItemsBindingInfo.template) {
      return;
    }

    var oTemplate = oItemsBindingInfo.template;
    var aCells = oTemplate.getCells();

    aCells.forEach(function (oCell, iIndex) {
      if (oCell && oCell.isA && oCell.isA("sap.m.Link")) {
        var oText = createTextFromLink(oCell);
        oTemplate.removeCell(oCell);
        oCell.destroy();
        oTemplate.insertCell(oText, iIndex);
      }
    });
  }

  function convertGridTableLinksToText(oTable) {
    var aColumns = oTable.getColumns();

    aColumns.forEach(function (oColumn) {
      var oTemplate = oColumn && oColumn.getTemplate && oColumn.getTemplate();
      if (oTemplate && oTemplate.isA && oTemplate.isA("sap.m.Link")) {
        var oText = createTextFromLink(oTemplate);
        oColumn.setTemplate(oText);
      }
    });
  }

  function prepareTable(oTable) {
    if (!oTable || typeof oTable.addStyleClass !== "function" || !oTable.isA) {
      return;
    }

    oTable.addStyleClass("appListCompact");

    if (oTable.isA("sap.m.Table")) {
      convertResponsiveTableLinksToText(oTable);
    } else if (oTable.isA("sap.ui.table.Table")) {
      convertGridTableLinksToText(oTable);
    }

    if (typeof oTable.invalidate === "function") {
      oTable.invalidate();
    }
  }

  return ControllerExtension.extend("kassenbeleg.ansicht.kassenbelegansicht.ext.controller.ListReportExt", {
    override: {
      onInitSmartTableExtension: function (oEvent) {
        var oSmartTable = oEvent && oEvent.getSource && oEvent.getSource();
        var oTable = oSmartTable && oSmartTable.getTable && oSmartTable.getTable();
        prepareTable(oTable);
      },

      onAfterRenderingSmartTableExtension: function (oEvent) {
        var oSmartTable = oEvent && oEvent.getSource && oEvent.getSource();
        var oTable = oSmartTable && oSmartTable.getTable && oSmartTable.getTable();
        prepareTable(oTable);
      },

      onBeforeRebindTableExtension: function (oEvent) {
        var oSmartTable = oEvent && oEvent.getSource && oEvent.getSource();
        var oTable = oSmartTable && oSmartTable.getTable && oSmartTable.getTable();
        prepareTable(oTable);
      },

      onInitSmartFilterBarExtension: function (oEvent) {
        var that = this;
        var oSmartFilterBar = oEvent && oEvent.getSource && oEvent.getSource();
        if (this.base && typeof this.base.onInitSmartFilterBarExtension === "function") {
          this.base.onInitSmartFilterBarExtension.apply(this, arguments);
        }

        if (oSmartFilterBar && typeof oSmartFilterBar.attachEventOnce === "function") {
          var fnTriggerSearch = function () {
            if (typeof oSmartFilterBar.search === "function") {
              oSmartFilterBar.search();
            } else if (that.base && that.base.getExtensionAPI && typeof that.base.getExtensionAPI === "function") {
              var oExtensionAPI = that.base.getExtensionAPI();
              if (oExtensionAPI && typeof oExtensionAPI.refreshTable === "function") {
                oExtensionAPI.refreshTable(true);
              }
            }
          };

          oSmartFilterBar.attachEventOnce("initialise", fnTriggerSearch);
          oSmartFilterBar.attachEventOnce("afterVariantInitialise", fnTriggerSearch);
        }
      }
    }
  });
});
