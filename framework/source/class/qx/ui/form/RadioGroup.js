/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * The radio group handles a collection of items from which only one item
 * can be selected. Selection another item will deselect the previously selected
 * item.
 *
 * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
 * or {@link qx.ui.toolbar.RadioButton} instances.
 */
qx.Class.define("qx.ui.form.RadioGroup",
{
  extend : qx.core.Object,
  implement : [qx.ui.form.IFormElement, qx.ui.core.ISingleSelection],
  include : qx.ui.core.MSingleSelectionHandling,

  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  
  /**
   * @param varargs {qx.core.Object} A variable number of items, which are
   *     intially added to the radio group.
   */
  construct : function(varargs)
  {
    this.base(arguments);

    // create item array
    this.__items = [];

    // add listener bevore call add!!!
    this.addListener("changeSelection", this.__onChangeSelection, this);
    
    if (varargs != null) {
      this.add.apply(this, arguments);
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  
  properties :
  {
    /**
     * Whether the radio group is enabled
     */
    enabled :
    {
      check : "Boolean",
      apply : "_applyEnabled",
      event : "changeEnabled"
    },

    /**
     * The name of the radio group. Mainly used for seralization proposes.
     */
    name :
    {
      check : "String",
      nullable : true,
      apply : "_applyName",
      event : "changeName"
    },

    /**
     * Whether the selection should wrap arond. This means that the successor of
     * the last item is the first item.
     */
    wrap :
    {
      check : "Boolean",
      init: true
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** 
     * Fired when the value was modified (after selection change) 
     * 
     * Event data: The new value. As defined in {@link qx.ui.menu.RadioButton#value}
     */
    "changeValue" : "qx.event.type.Data",
    
    /** 
     * Fires after the selection was modified
     * @deprecated Use 'changeSelection' instead!
     */
    "changeSelected" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  
  members :
  {
    /** {qx.ui.form.IRadioItem[]} The items of the radio group */
    __items : null,

    
    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    
    /**
     * Get all managed items
     *
     * @return {qx.ui.form.IRadioItem[]} All managed items.
     */
    getItems : function() {
      return this.__items;
    },

    /**
     * Set the checked state of a given item.
     *
     * @deprecated Use 'setSelection' instead!
     * @param item {qx.ui.form.IRadioItem} The item to select.
     */
    select : function(item) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'setSelection' instead!"
      );
      
      this.setSelection([item]);
    },

    /**
     * Select the radio item, with the given value.
     *
     * @param value {String} Value of the radio item to select.
     */
    setValue : function(value)
    {
      var items = this.__items;
      var item;

      for (var i=0, l=items.length; i<l; i++)
      {
        item = items[i];

        if (item.getValue() == value)
        {
          this.setSelection([item]);
          break;
        }
      }
    },

    /**
     * Get the value of the selected radio item
     *
     * @return {String | null} The value of the selected radio item. Returns
     *     <code>null</code> if no item is selected.
     */
    getValue : function()
    {
      var selected = this.getSelection()[0];
      return selected ? selected.getValue() : null;
    },


    /*
    ---------------------------------------------------------------------------
      REGISTRY
    ---------------------------------------------------------------------------
    */

    
    /**
     * Add the passed items to the radio group.
     *
     * @param varargs {qx.ui.form.IRadioItem} A variable number of items to add.
     */
    add : function(varargs)
    {
      var items = this.__items;
      var item;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        item = arguments[i];

        if (item.getGroup() === this) {
          continue;
        }

        // Register listeners
        item.addListener("changeChecked", this._onItemChangeChecked, this);

        // Push RadioButton to array
        items.push(item);

        // Inform radio button about new group
        item.setGroup(this);

        // Need to update internal value?
        if (item.getChecked()) {
          this.setSelection([item]);
        }
      }

      // Select first item when only one is registered
      if (items.length > 0 && !this.getSelection()[0]) {
        this.setSelection([items[0]]);
      }
    },

    /**
     * Remove an item from the radio group.
     *
     * @param item {qx.ui.form.IRadioItem} The item to remove.
     */
    remove : function(item)
    {
      if (item.getGroup() === this)
      {
        // Remove RadioButton from array
        qx.lang.Array.remove(this.__items, item);

        // Inform radio button about new group
        item.resetGroup();

        // Deregister listeners
        item.removeListener("changeChecked", this._onItemChangeChecked, this);

        // if the radio was checked, set internal selection to null
        if (item.getChecked()) {
          this.resetSelection();
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      LISTENER FOR ITEM CHANGES
    ---------------------------------------------------------------------------
    */

    
    /**
     * Event listener for <code>changeChecked</code> event of every managed item.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onItemChangeChecked : function(e)
    {
      var item = e.getTarget();
      if (item.getChecked()) {
        this.setSelection([item]);
      } else if (this.getSelection()[0] == item) {
        this.resetSelection();
      }
    },


    /*
    ---------------------------------------------------------------------------
      OLD SELECTION PROPERTY METHDS
    ---------------------------------------------------------------------------
    */

    
    /**
     * Select the item in the list.
     * 
     * @deprecated Use 'setSelection' instead!
     * @param item {qx.ui.form.IRadioItem} Item to select.
     */
    setSelected : function(item)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'setSelection' instead!"
      );
      
      this.setSelection([item]);
    },
    
    /**
     * Returns the selected item in the list.
     *
     * @deprecated Use 'getSelection' instead!
     * @return {qx.ui.form.IRadioItem} Selected item.
     */
    getSelected : function()
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getSelection' instead!"
      );
      
      var item = this.getSelection()[0];
      if (item) {
        return item
      } else {
        return null;
      }
    },
    
    /**
     * Reset the current selection.
     * 
     * @deprecated Use 'resetSelection' instead!
     */
    resetSelected : function()
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'resetSelection' instead!"
      );
      
      this.resetSelection();
    },
    
    
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    
    // property apply
    _applyEnabled : function(value, old)
    {
      var items = this.__items;
      if (value == null)
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].resetEnabled();
        }
      }
      else
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].setEnabled(true);
        }
      }
    },

    // property apply
    _applyName : function(value, old)
    {
      var items = this.__items;
      if (value == null)
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].resetName();
        }
      }
      else
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].setName(value);
        }
      }
    },

    
    /**
     * Return the value from the item.
     * 
     * @param item {qx.ui.form.IRadioItem} The item.
     * @return {String|null} Value from the item. 
     */
    __getValue : function(item)
    {
      var value = null;

      if (item)
      {
        value = item.getValue();
        if (value == null) {
          value = item.getLabel();
        }
      }
      
      return value;
    },


    /*
    ---------------------------------------------------------------------------
      SELECTION
    ---------------------------------------------------------------------------
    */

    
    /**
     * Select the item following the given item.
     */
    selectNext : function()
    {
      var item = this.getSelection()[0];
      var items = this.__items;
      var index = items.indexOf(item);
      if (index == -1) {
        return;
      }

      var i = 0;
      var length = items.length;

      // Find next enabled item
      if (this.getWrap()) {
        index = (index + 1) % length;
      } else {
        index = Math.min(index + 1, length - 1);
      }

      while (i < length && !items[index].getEnabled())
      {
        index = (index + 1) % length;
        i++;
      }

      this.setSelection([items[index]]);
    },


    /**
     * Select the item previous the given item.
     */
    selectPrevious : function()
    {
      var item = this.getSelection()[0];
      var items = this.__items;
      var index = items.indexOf(item);
      if (index == -1) {
        return;
      }

      var i = 0;
      var length = items.length;

      // Find previous enabled item
      if (this.getWrap()) {
        index = (index - 1 + length) % length;
      } else {
        index = Math.max(index - 1, 0);
      }

      while (i < length && !items[index].getEnabled())
      {
        index = (index - 1 + length) % length;
        i++;
      }

      this.setSelection([items[index]]);
    },

    
    /*
    ---------------------------------------------------------------------------
      HELPER METHODS FOR SELECTION API
    ---------------------------------------------------------------------------
    */

    
    /**
     * Returns the items for the selection.
     * 
     * @return {qx.ui.form.IRadioItem[]} Itmes to select.
     */
    _getItems : function() {
      return this.getItems();
    },
    
    /**
     * Returns if the selection could be empty or not.
     * 
     * @return {Boolean} <code>true</code> If selection could be empty, 
     *    <code>false</code> otherwise.
     */
    _isAllowEmptySelection: function() {
      return true;
    },
    
    /**
     * Event handler for <code>changeSelection</code>.
     * 
     * @param e {qx.event.type.Data} Data event.
     */
    __onChangeSelection : function(e)
    {
      var value = e.getData()[0];
      var old = e.getOldData()[0];
      
      if (old) {
        old.setChecked(false);
      }

      if (value) {
        value.setChecked(true);
      }

      // Fire value change event
      var oldValue = this.__getValue(old);
      var newValue = this.__getValue(value);
      this.fireDataEvent("changeValue", newValue, oldValue);
      
      /*
       * TODO remove this if the methods and event for old selection API
       * doesn't exist. 
       * 
       * Methods: 'getSelected', 'setSelected', 'resetSelected'
       * Event: 'changeSelected'
       */ 
      if (this.hasListener("changeSelected")) {
        this.fireDataEvent("changeSelected", value, old);
      }
    },

    // overridden
    addListener : function(type, listener, self, capture)
    {
      /*
       * TODO this method must be removed if the old selection API doesn't exist. 
       * 
       * Methods: 'getSelected', 'setSelected', 'resetSelected'
       * Event: 'changeSelected'
       */
      
      if (type === "changeSelected") {
        qx.log.Logger.deprecatedEventWarning(
        arguments.callee,
        "changeSelected",
        "Use 'changeSelection' instead!");
      }
      
      return this.base(arguments, type, listener, self, capture);
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  
  destruct : function() {
    this._disposeArray("__items");
  }
});
