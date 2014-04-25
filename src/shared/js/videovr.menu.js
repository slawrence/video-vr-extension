/**
 * Creates videojs menus
 */
;var VIDEO_VR = (function (my, vjs) {

    var player,
        container,
        scene;

    if (!videojs) {
        console.error("Uh oh videojs is not defined!");
        return;
    }

    /**
     * Add the menu options
     */
    function initMenu() {
        vjs.ProjectionSelector = vjs.MenuButton.extend({
            init : function(player, options) {
                player.availableProjections = options.availableProjections || [];
                vjs.MenuButton.call(this, player, options);
            }
        });

        //Top Item - not selectable
        vjs.ProjectionTitleMenuItem = vjs.MenuItem.extend({
            init : function(player, options) {
                vjs.MenuItem.call(this, player, options);
                this.off('click'); //no click handler
            }
        });

        //Menu Item
        vjs.ProjectionMenuItem = vjs.MenuItem.extend({
            init : function(player, options){
                options.label = options.res;
                options.selected = (options.res.toString() === player.getCurrentRes().toString());
                vjs.MenuItem.call(this, player, options);
                this.resolution = options.res;
                this.on('click', this.onClick);
                player.on('changeProjection', vjs.bind(this, function() {
                    if (this.resolution === player.getCurrentRes()) {
                        this.selected(true);
                    } else {
                        this.selected(false);
                    }
                }));
            }
        });

        // Handle clicks on the menu items
        vjs.ProjectionMenuItem.prototype.onClick = function() {
            var player = this.player(),
            button_nodes = player.controlBar.projectionSelection.el().firstChild.children,
            button_node_count = button_nodes.length;

            // Save the newly selected resolution in our player options property
            scene.changeProjection(this.resolution);

            // Update the button text
            while ( button_node_count > 0 ) {
                button_node_count--;
                if ( 'vjs-current-res' === button_nodes[button_node_count].className ) {
                    button_nodes[button_node_count].innerHTML = this.resolution;
                    break;
                }
            }
        };

        // Create a menu item for each available projection
        vjs.ProjectionSelector.prototype.createItems = function() {
            var player = this.player(),
            items = [];

            // Add the menu title item
            items.push( new vjs.ProjectionTitleMenuItem( player, {
                el : vjs.Component.prototype.createEl( 'li', {
                    className : 'vjs-menu-title vjs-res-menu-title',
                    innerHTML : 'Projections'
                })
            }));

            // Add an item for each available resolution
            player.availableProjections.forEach(function (proj) {
                items.push( new vjs.ProjectionMenuItem( player, {
                    res : proj
                }));
            });

            return items;
        };
    }

    function addMenu(cb) {
        player.getCurrentRes = function() {
            return player.currentProjection || '';
        };

        // Add the resolution selector button
        var projectionSelection = new vjs.ProjectionSelector( player, {
            el : vjs.Component.prototype.createEl( null, {
                className : 'vjs-res-button vjs-menu-button vjs-control',
                innerHTML : '<div class="vjs-control-content"><span class="vjs-current-res">' + ( player.currentProjection || 'Projections' ) + '</span></div>',
                role    : 'button',
                'aria-live' : 'polite', // let the screen reader user know that the text of the button may change
                tabIndex  : 0
            }),
            availableProjections : scene.getAvailableProjections()
        });

        // Add the button to the control bar object and the DOM
        cb.projectionSelection = cb.addChild( projectionSelection );
    }

    function initVRControls () {
        var controlEl = container.getElementsByClassName('vjs-control-bar')[0];
        var left = vjs.Component.prototype.createEl( null, {
            className : 'videojs-vr-controls',
            innerHTML : '<div></div>',
            tabIndex  : 0
        });
        var right = vjs.Component.prototype.createEl( null, {
            className : 'videojs-vr-controls',
            innerHTML : '<div></div>',
            tabIndex  : 0
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
        addMenu(controlElRight);

        //insert nodes into left and right
        left.insertBefore(controlEl, left.firstChild);
        right.insertBefore(controlElRight.el(), right.firstChild);

        //insert left and right nodes into DOM
        container.insertBefore(left, container.firstChild);
        container.insertBefore(right, container.firstChild);
    }

    my.menu = {};
    my.menu.init = function (sc) {
        initMenu();
        player = sc.player;
        scene = sc;
        container = sc.container;
        addMenu(player.controlBar);
        if (my.vr.enabled) {
            initVRControls();
        }
    };

    return my;

}(VIDEO_VR || {}, videojs));
