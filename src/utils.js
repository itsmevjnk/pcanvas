import { onActivated, onMounted } from 'vue';

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

export function disable_ctx_menu_all_onmount() {
    onMounted(disable_ctx_menu_all);
}

export function refresh_autofocus_onmount() {
    onMounted(() => {
        document.querySelectorAll('[autofocus]').forEach((e) => {
            console.log(e);
            e.focus();
        });
    });
}