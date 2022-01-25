// Variables y Selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');



// Eventos
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGastos);
}



// Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto( gasto ) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( (total, gasto) => total + parseFloat(gasto.cantidad), 0 );
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id !== id );
        this.calcularRestante();
    }

}

class UI {
    insertarPresupuesto( cantidad ) {
        const { presupuesto, restante } = cantidad;

        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta( mensaje, tipo ) {
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        divMensaje.textContent = mensaje;

        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastos( gastos ) {
        this.limpiarHTML();
        gastos.forEach( gasto => {
            const { nombre, cantidad, id } = gasto;

            // Crear un LI
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;

            // Agregar el HTML del gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill"> ${cantidad} </span>`;

            // Boton para borra el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.textContent = 'Borrar X';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }

            nuevoGasto.appendChild(btnBorrar);

            // Agregar al HTML
            gastoListado.appendChild(nuevoGasto);
        });
    }

    limpiarHTML() {
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante( restante ) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');

        // Comprobar si se gasto mas del 25% del presupuesto
        if( (presupuesto / 4) > restante ) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if( (presupuesto / 2) > restante ) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else{
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Comprobar que el presupuesto no se pase de 0
        if(restante <= 0){
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        } else{
            formulario.querySelector('button[type="submit"]').disabled = false;
        }
    }

}

// Instanciar
const ui = new UI();
let presupuesto;

// Funciones
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt( '¿Cual es tu presupuesto?' );

    if( presupuestoUsuario == '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
}

function agregarGastos(e) {
    e.preventDefault();

    const nombre = document.querySelector('#gasto').value;
    const cantidad = document.querySelector('#cantidad').value;

    if( nombre === '' || cantidad === '' ){
        ui.imprimirAlerta('Ambos campos son obligatorios!', 'error');

        return;
    } else if( cantidad <= 0 || isNaN(cantidad) ){
        ui.imprimirAlerta('Cantidad no valida', 'error');

        return;
    }

    // Generar un objeto de gastos
    const gasto = { nombre, cantidad, id: Date.now() }

    presupuesto.nuevoGasto(gasto);
    
    // Imprimir los gastos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.imprimirAlerta('Gasto agregado correctamente!');

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    formulario.reset();

}

function eliminarGasto(id) {
    presupuesto.eliminarGasto(id);
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}