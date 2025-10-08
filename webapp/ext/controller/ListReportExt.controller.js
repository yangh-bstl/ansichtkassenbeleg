sap.ui.define([
  "sap/ui/core/mvc/ControllerExtension",
  "sap/m/Text"
], function (ControllerExtension, Text) {
  "use strict";

  function convertLinksToText(oTable) {
    if (!oTable || !oTable.isA || !oTable.isA("sap.m.Table")) {
      return;
    }

    var oItemsBindingInfo = oTable.getBindingInfo("items");
    if (!oItemsBindingInfo || !oItemsBindingInfo.template) {
      return;
    }

    var oTemplate = oItemsBindingInfo.template;
    var aCells = oTemplate.getCells();

    aCells.forEach(function (oCell, iIndex) {
      if (oCell && oCell.isA && oCell.isA("sap.m.Link")) {
        var oText = new Text({
          wrapping: false
        });

        var oTextBindingInfo = oCell.getBindingInfo("text");
        if (oTextBindingInfo) {
          oText.bindProperty("text", oTextBindingInfo);
        } else if (typeof oCell.getText === "function") {
          oText.setText(oCell.getText());
        }

        var oTooltipBindingInfo = oCell.getBindingInfo("tooltip");
        if (oTooltipBindingInfo) {
          oText.bindProperty("tooltip", oTooltipBindingInfo);
        } else if (typeof oCell.getTooltip === "function") {
          oText.setTooltip(oCell.getTooltip());
        }

        oTemplate.removeCell(oCell);
        oCell.destroy();
        oTemplate.insertCell(oText, iIndex);
      }
    });
  }

  function prepareTable(oTable) {
    if (!oTable) {
      return;
    }

    if (typeof oTable.addStyleClass === "function") {
      oTable.addStyleClass("appListCompact");
    }

    convertLinksToText(oTable);
  }

  return ControllerExtension.extend("kassenbeleg.ansicht.kassenbelegansicht.ext.controller.ListReportExt", {
    override: {
      onInitSmartTableExtension: function (oEvent) {
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
        var oSmartFilterBar = oEvent && oEvent.getSource && oEvent.getSource();
        if (oSmartFilterBar && typeof oSmartFilterBar.attachEventOnce === "function") {
          oSmartFilterBar.attachEventOnce("initialise", function () {
            if (typeof oSmartFilterBar.search === "function") {
              oSmartFilterBar.search();
            }
          });
        }
      }
    }
  });
});
