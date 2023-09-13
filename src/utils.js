export function disable_ctx_menu(elem) {
    elem.addEventListener('contextmenu', function(e) {
        if(e.button == 2) e.preventDefault();
    });
}

export function disable_ctx_menu_all() {
    let elems = document.getElementsByClassName('no-ctx-menu');
    Array.prototype.forEach.call(elems, function(elem) {
        disable_ctx_menu(elem);
    });
};