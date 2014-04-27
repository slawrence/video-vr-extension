/**
 * Creates videojs projection menu for the control bar and adds it to the player
 */
;var VIDEO_VR = (function (my, vjs) {
    if (!videojs) {
        console.error("Uh oh videojs is not defined!");
        return;
    }

    /**
     * Add the menu options
     */
    function initMenu(scene) {
        vjs.ProjectionSelector = vjs.MenuButton.extend({
            init: function(player, options) {
                player.projections = options.projections || [];
                vjs.MenuButton.call(this, player, options);
            }
        });

        //Top Item - not selectable
        vjs.ProjectionTitleMenuItem = vjs.MenuItem.extend({
            init: function(player, options) {
                vjs.MenuItem.call(this, player, options);
                this.off('click'); //no click handler
            }
        });

        //Menu Item
        vjs.ProjectionMenuItem = vjs.MenuItem.extend({
            init: function(player, options){
                options.label = options.projection;
                options.selected = (options.projection === player.currentProjection);
                vjs.MenuItem.call(this, player, options);
                this.projection = options.projection;
                this.on('click', this.onClick);
                player.on('changeProjection', vjs.bind(this, function() {
                    this.selected(this.projection === player.currentProjection);
                }));
            }
        });

        // Handle clicks on the menu items
        vjs.ProjectionMenuItem.prototype.onClick = function() {
            var player = this.player(),
            button_nodes = player.controlBar.projectionSelection.el().firstChild.children,
            button_node_count = button_nodes.length;

            // Save the newly selected projection in our player options property
            scene.changeProjection(this.projection);

            // Update the button text
            while ( button_node_count > 0 ) {
                button_node_count--;
                if ( 'vjs-current-projection' === button_nodes[button_node_count].className ) {
                    button_nodes[button_node_count].innerHTML = this.projection;
                    break;
                }
            }
        };

        // Create a menu item for each available projection
        vjs.ProjectionSelector.prototype.createItems = function() {
            var player = this.player(),
            items = [];

            // Add the menu title item
            items.push(new vjs.ProjectionTitleMenuItem(player, {
                el: vjs.Component.prototype.createEl('li', {
                    className: 'vjs-menu-title vjs-projection-menu-title',
                    innerHTML: 'Projections'
                })
            }));

            // Add an item for each available projection
            player.projections.forEach(function (projection) {
                items.push(new vjs.ProjectionMenuItem(player, {
                    projection: projection
                }));
            });

            return items;
        };
    }

    function addMenu(controlbar, projections, player) {
        // Add the projection selector button
        var projectionSelection = new vjs.ProjectionSelector(player, {
            el: vjs.Component.prototype.createEl(null, {
                className : 'vjs-projection-button vjs-menu-button vjs-control',
                innerHTML : '<div class="vjs-control-content"><span class="vjs-current-projection">' + (player.currentProjection || 'Projections' ) + '</span></div>',
                role    : 'button',
                'aria-live' : 'polite',
                tabIndex  : 0
            }),
            projections : projections
        });

        // Add the button to the control bar object and the DOM
        controlbar.projectionSelection = controlbar.addChild(projectionSelection);
    }

    function initVRControls (container, projections, player) {
        var controlEl = container.getElementsByClassName('vjs-control-bar')[0];
        var left = vjs.Component.prototype.createEl(null, {
            className: 'videojs-vr-controls',
            innerHTML: '<div></div>',
            tabIndex: 0
        });
        var right = vjs.Component.prototype.createEl(null, {
            className: 'videojs-vr-controls',
            innerHTML: '<div></div>',
            tabIndex: 0
        });

        function addStyle(theEl) {
            theEl.style.position = "absolute";
            theEl.style.top = "50%";
            theEl.style.height = "50px";
            theEl.style.width = "30%";
            theEl.style.margin = "-25px 0 0 -20%";
            return theEl;
        }
        left = addStyle(left);
        left.style.left = "35%";
        right = addStyle(right);
        right.style.left = "75%";

        //copy controlEl
        var controlElRight = new vjs.ControlBar(player, {name: 'controlBar'});
        addMenu(controlElRight, projections, player);

        //insert nodes into left and right
        left.insertBefore(controlEl, left.firstChild);
        right.insertBefore(controlElRight.el(), right.firstChild);

        //insert left and right nodes into DOM
        container.insertBefore(left, container.firstChild);
        container.insertBefore(right, container.firstChild);
    }

    my.menu = {};
    my.menu.init = function (scene) {
        var player = scene.player,
            projections = scene.getAvailableProjections();

        initMenu(scene);
        addMenu(player.controlBar, projections, player);
        if (my.vr.enabled) {
            initVRControls(scene.container, projections, player);
        }
    };

    return my;

}(VIDEO_VR || {}, videojs));
