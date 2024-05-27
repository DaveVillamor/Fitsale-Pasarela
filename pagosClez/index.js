document.addEventListener('DOMContentLoaded', async () => {
  let urlParams = new URLSearchParams(window.location.search);

  let token = urlParams.get('token');

  let id_tercero = urlParams.get('id_tercero');

  let id_plan = urlParams.get('id_plan');
  let id_sucursal = urlParams.get('id_sucursal');

  let data = {};

  let fecha = document.getElementById('fechaInicio');
  flatpickr(fecha, {
    mode: 'single',
    dateFormat: 'Y-m-d',
    minDate: 'today',
    onClose: function (selectedDates, dateStr, instance) {
      if (selectedDates.length == 0) {
        return;
      }
    },
    // default hoy
    defaultDate: new Date(),
  });

  if (urlParams.get('token') == null) {
    document.getElementById('notToken').style.display = 'flex';
    document.getElementById('Token').style.display = 'none';
    return;
  } else {
    let dataLicencia = await axios.post('https://app.clez.co/index.php?r=APIfitsale/getLicenciaByToken', {
      token,
    });
    if (dataLicencia.data == false) {
      document.getElementById('notToken').style.display = 'flex';
      document.getElementById('Token').style.display = 'none';
      return;
    } else {
      document.getElementById('notToken').style.display = 'none';
      document.getElementById('Token').style.display = 'block';
      document.getElementById('selects').style.display = 'none';
      document.getElementById('viewPay').style.display = 'none';
      document.getElementById('cardsSaveds').style.display = 'none';

      document.getElementById('logo').src = `https://app.clez.co/${dataLicencia.data.imagen_logo_pago}`;
      document.getElementById('nombreLicencia').innerText = dataLicencia.data.nombre;
      document.getElementById('divImgLogo').style.backgroundColor = dataLicencia.data.color_secundario;

      // si existe el id_plan y el id_sucursal mostrar una alerta
      if (id_plan && id_sucursal) {
        document.getElementById('selects').style.display = 'none';
        document.getElementById('btn-volver').style.display = 'none';
        document.getElementById('formPay').style.display = 'none';
        document.getElementById('viewPay').style.display = 'block';
        document.getElementById('formTercero').style.display = 'block';
        document.getElementById('headCardInfo').classList.add('d-none');

        let planes = await axios.post('https://app.clez.co/index.php?r=APIfitsale/getPlanes', {
          token,
          id_sucursal,
          id_plan,
        });
        let plan = planes.data.planes[0];

        if (plan.debito_automatico == 1) document.querySelector('.pseMetod').classList.add('d-none');
        else document.querySelector('.pseMetod').classList.remove('d-none');

        plan.precio_venta = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
        }).format(plan.precio_venta);
        document.getElementById('nombrePlan').innerText = plan.nombre_plan;
        document.getElementById('precioPlan').innerText = plan.precio_venta;
        document.getElementById('viewPayContentCard').setAttribute('data-id_plan', plan.id_plan);
      }

      // si no viene el id_plan y el id_sucursal mostrar una alerta
      if (!id_plan && !id_sucursal) {
        document.getElementById('selects').style.display = 'block';
        document.getElementById('viewPay').style.display = 'none';
        let citys = await axios.post('https://app.clez.co/index.php?r=APIfitsale/getPlanes', {
          token,
        });
        // si hay ciudades agregarlas al select con el id ciudad
        if (citys.data.ciudades.length > 0) {
          citys.data.ciudades.forEach((city) => {
            let option = document.createElement('option');
            option.value = city.id_ciudad;
            option.text = city.nombre_ciudad;
            document.getElementById('ciudad').appendChild(option);
          });
        }

        document.getElementById('ciudad').addEventListener('change', async (e) => {
          document.getElementById('sucursal').value = '';
          document.getElementById('plan').value = '';
          let sucursales = await axios.post('https://app.clez.co/index.php?r=APIfitsale/getPlanes', {
            token,
            id_ciudad: e.target.value,
          });
          if (sucursales.data.sucursales.length > 0) {
            sucursales.data.sucursales.forEach((sucursal) => {
              let option = document.createElement('option');
              option.value = sucursal.id_sucursal;
              option.text = sucursal.nombre_sucursal;
              document.getElementById('sucursal').appendChild(option);
            });
          }
        });

        document.getElementById('sucursal').addEventListener('change', async (e) => {
          document.getElementById('plan').value = '';
          let planes = await axios.post('https://app.clez.co/index.php?r=APIfitsale/getPlanes', {
            token,
            id_sucursal: e.target.value,
          });
          if (planes.data.planes.length > 0) {
            planes.data.planes.forEach((plan) => {
              let option = document.createElement('option');
              option.value = plan.id_plan;
              option.text = plan.nombre_plan;
              document.getElementById('plan').appendChild(option);
            });
          }
          document.getElementById('plan').addEventListener('change', async (e) => {
            planes.data.planes.forEach((plan) => {
              if (plan.id_plan == e.target.value) {
                plan.precio_venta = new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                }).format(plan.precio_venta);
                document.getElementById('nombrePlan').innerText = plan.nombre_plan;
                document.getElementById('precioPlan').innerText = plan.precio_venta;
                document.getElementById('viewPayContentCard').setAttribute('data-id_plan', plan.id_plan);

                if (plan.debito_automatico == 1) document.querySelector('.pseMetod').classList.add('d-none');
                else document.querySelector('.pseMetod').classList.remove('d-none');
              }
            });
          });
        });
      }

      if (id_plan && id_sucursal && id_tercero) {
        try {
          let tercero = await axios.post('https://app.clez.co/index.php?r=APIfitsale/getTerceroByID', {
            id_tercero,
          });
          if (tercero.data) {
            document.getElementById('nameView').value = tercero.data.nombre1;
            document.getElementById('lastNameView').value = tercero.data.apellido1;
            document.getElementById('emailView').value = tercero.data.email;
            document.getElementById('phoneView').value = tercero.data.telefono_movil;

            document.getElementById('selects').style.display = 'none';
            document.getElementById('btn-volver').style.display = 'none';
            document.getElementById('formTercero').style.display = 'none';
            document.getElementById('viewPay').style.display = 'block';
            document.getElementById('formPay').style.display = 'block';
            document.getElementById('headCardInfo').classList.remove('d-none');

            let planes = await axios.post('https://app.clez.co/index.php?r=APIfitsale/getPlanes', {
              token,
              id_sucursal,
              id_plan,
            });
            let plan = planes.data.planes[0];

            if (plan.debito_automatico == 1) document.querySelector('.pseMetod').classList.add('d-none');
            else document.querySelector('.pseMetod').classList.remove('d-none');

            plan.precio_venta = new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
            }).format(plan.precio_venta);
            document.getElementById('nombrePlan').innerText = plan.nombre_plan;
            document.getElementById('precioPlan').innerText = plan.precio_venta;
            document.getElementById('viewPayContentCard').setAttribute('data-id_plan', plan.id_plan);

            if (tercero.data.tarjetas.length != 0) {
              document.getElementById('cardsSaveds').style.display = 'block';
              tercero.data.tarjetas.forEach((fuente) => {
                console.log(fuente);
                let element = null;
                if (fuente.type == 'NEQUI')
                  element = `
                  <button class="btn w-100 my-2" id="cardSave" data-id="${fuente.fuente_pago}">
                    <div>
                      <img src="https://assets-global.website-files.com/6317a229ebf7723658463b4b/64dfef05bc6705edb9447499_nequi.svg" alt="" style="width: 50px" />
                    </div>
                    <div class="d-flex justify-content-center align-items-end flex-column">
                      <span style="font-size: 1em">${fuente.phone_number}</span>
                    </div>
                  </button>`;
                if (fuente.type == 'CARD') {
                  console.log();
                  element = `
                  <button class="btn w-100 my-2" id="cardSave" data-id="${fuente.fuente_pago}">
                  <div>
                      ${
                        detectarTipoTarjeta(fuente.bin) == 'Visa'
                          ? `<i style="font-size: 2em;" class="fa-brands fa-cc-visa"></i>`
                          : detectarTipoTarjeta(fuente.bin) == 'MasterCard'
                          ? `<i style="font-size: 2em;" class="fa-brands fa-cc-mastercard"></i>`
                          : detectarTipoTarjeta(fuente.bin) == 'American Express'
                          ? `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/American_Express_logo.svg/1200px-American_Express_logo.svg.png" alt="" style="width: 50px" />`
                          : detectarTipoTarjeta(fuente.bin) == 'Diners Club'
                          ? `<i style="font-size: 2em;" class="fa-brands fa-cc-diners-club"></i>`
                          : detectarTipoTarjeta(fuente.bin) == 'Discover'
                          ? `<i style="font-size: 2em;" class="fa-brands fa-cc-discover"></i>`
                          : detectarTipoTarjeta(fuente.bin) == 'JCB'
                          ? `<i style="font-size: 2em;" class="fa-brands fa-cc-jcb"></i>`
                          : ''
                      }
                      
                    </div>
                    <div class="d-flex justify-content-center align-items-end flex-column">
                      <span style="font-size: 1em">${fuente.name}</span>
                      <span>**** ${fuente.last_four}</span>
                    </div>
                  </button>`;
                }
                document.getElementById('cardsSaveds').insertAdjacentHTML('beforeend', element);
              });
              document.querySelectorAll('#cardSave').forEach((card) => {
                card.addEventListener('click', async (e) => {
                  console.log(e.target.closest('button').getAttribute('data-id'));

                  data.id_tercero = data.id_tercero ? data.id_tercero : id_tercero;
                  data.id_plan = data.id_plan ? data.id_plan : id_plan;
                  data.id_sucursal = data.id_sucursal ? data.id_sucursal : id_sucursal;
                  data.fuente_pago = data.fuente_pago ? data.fuente_pago : e.target.closest('button').getAttribute('data-id');

                  console.log(data);
                });
              });
            } else document.getElementById('cardsSaveds').style.display = 'none';
          }
        } catch (error) {
          document.getElementById('notToken').style.display = 'flex';
          document.getElementById('Token').style.display = 'none';
        }
      }
    }
  }

  let selects = true;
  let formTercero = false;
  let viewPay = false;

  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
        } else {
          event.preventDefault();
          document.getElementById('selects').style.display = 'none';
          document.getElementById('formPay').style.display = 'none';
          document.getElementById('headCardInfo').classList.add('d-none');
          document.getElementById('viewPay').style.display = 'block';
          document.getElementById('formTercero').style.display = 'block';

          form.querySelectorAll('select').forEach((select) => {
            if (select.id == 'ciudad') data.id_ciudad = select.value;
            if (select.id == 'sucursal') data.id_sucursal = select.value;
            if (select.id == 'plan') data.id_plan = select.value;
          });

          selects = false;
          viewPay = true;
          formTercero = true;
        }
      },
      false,
    );
  });

  const formsTercero = document.querySelectorAll('.formTercero');

  Array.from(formsTercero).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
        } else {
          event.preventDefault();
          document.getElementById('selects').style.display = 'none';
          document.getElementById('formTercero').style.display = 'none';
          document.getElementById('headCardInfo').classList.remove('d-none');
          document.getElementById('viewPay').style.display = 'block';
          document.getElementById('formPay').style.display = 'block';
          document.getElementById('btn-volver').style.display = 'block';

          let dataUser = {};
          form.querySelectorAll('input').forEach((input) => {
            if (input.id == '#documento') dataUser.documento = input.value;
            if (input.id == 'primerNombre') {
              dataUser.primer_nombre = input.value;
              document.getElementById('nameView').value = input.value;
            }
            if (input.id == 'primerApellido') {
              dataUser.primer_apellido = input.value;
              document.getElementById('lastNameView').value = input.value;
            }
            if (input.id == 'email') {
              dataUser.email = input.value;
              document.getElementById('emailView').value = input.value;
            }
            if (input.id == 'direccion') dataUser.direccion = input.value;
            if (input.id == 'phone') {
              dataUser.telefono = input.value;
              document.getElementById('phoneView').value = input.value;
            }
          });
          form.querySelectorAll('select').forEach((select) => {
            if (select.id == 'typeDoc') dataUser.tipo_documento = select.value;
          });

          data.user = dataUser;

          selects = false;
          viewPay = true;
          formTercero = false;
        }
      },
      false,
    );
  });

  document.getElementById('btn-volver').addEventListener('click', () => {
    if (selects) {
      document.getElementById('selects').style.display = 'block';
      document.getElementById('viewPay').style.display = 'none';
    }
    if (formTercero) {
      selects = true;
      formTercero = false;
      viewPay = false;
      document.getElementById('selects').style.display = 'block';
      document.getElementById('viewPay').style.display = 'none';
    }

    if (viewPay) {
      selects = false;
      formTercero = true;
      viewPay = false;
      if (id_plan && id_sucursal) document.getElementById('btn-volver').style.display = 'none';

      document.getElementById('selects').style.display = 'none';
      document.getElementById('formPay').style.display = 'none';
      document.getElementById('viewPay').style.display = 'block';
      document.getElementById('formTercero').style.display = 'block';
      document.getElementById('headCardInfo').classList.add('d-none');
    }
  });

  // TODO logica de pago con tarjeta

  document.querySelector('.cardMetod').addEventListener('click', () => {
    document.getElementById('selects').style.display = 'none';
    document.getElementById('formTercero').style.display = 'none';
    document.getElementById('formPay').style.display = 'none';
    document.getElementById('btn-volver').style.display = 'none';
    document.getElementById('headCardInfo').classList.add('d-none');
    document.getElementById('viewPay').style.display = 'block';
    document.getElementById('viewCard').classList.remove('d-none');
  });

  document.getElementById('btn-volver-card').addEventListener('click', () => {
    document.getElementById('selects').style.display = 'none';
    document.getElementById('formTercero').style.display = 'none';
    document.getElementById('viewCard').classList.add('d-none');
    document.getElementById('formPay').style.display = 'block';
    document.getElementById('headCardInfo').classList.remove('d-none');
    document.getElementById('viewPay').style.display = 'block';

    if (!id_tercero) document.getElementById('btn-volver').style.display = 'block';
    else document.getElementById('btn-volver').style.display = 'none';
  });

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const card = document.querySelectorAll('.cardCredit');

  // Loop over them and prevent submission
  Array.from(card).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
        } else {
          event.preventDefault();
          if (document.getElementById('numeroCard').value.length != 16) {
            document.getElementById('numeroCard').classList.add('is-invalid');
            return Swal.fire({
              position: 'center',
              icon: 'warning',
              title: 'El número de la tarjeta debe tener 16 digitos',
              showConfirmButton: false,
              timer: 2000,
            });
          } else document.getElementById('numeroCard').classList.remove('is-invalid');
          if (document.getElementById('cvvCard').value.length != 3) {
            document.getElementById('cvvCard').classList.add('is-invalid');
            return Swal.fire({
              position: 'center',
              icon: 'warning',
              title: 'El cvv de la tarjeta debe tener 3 digitos',
              showConfirmButton: false,
              timer: 2000,
            });
          } else document.getElementById('cvvCard').classList.remove('is-invalid');

          //  logica de pago con tarjeta

          let dataCard = {};
          form.querySelectorAll('input').forEach((input) => {
            if (input.id == 'nombreCard') dataCard.card_holder = input.value;
            if (input.id == 'numeroCard') dataCard.number = input.value;
            if (input.id == 'cvvCard') dataCard.cvc = input.value;
          });

          form.querySelectorAll('select').forEach((select) => {
            if (select.id == 'mesCard') dataCard.exp_month = select.value;
            if (select.id == 'anioCard') dataCard.exp_year = select.value;
          });

          data.card = dataCard;
          data.payment_method = 'CARD';
          data.id_tercero = data.id_tercero ? data.id_tercero : id_tercero;
          data.id_plan = data.id_plan ? data.id_plan : id_plan;
          data.id_sucursal = data.id_sucursal ? data.id_sucursal : id_sucursal;

          console.log(data);
        }
      },
      false,
    );
  });

  // TODO logica de pago con nequi
  document.querySelector('.nequiMetod').addEventListener('click', () => {
    document.getElementById('selects').style.display = 'none';
    document.getElementById('formTercero').style.display = 'none';
    document.getElementById('formPay').style.display = 'none';
    document.getElementById('btn-volver').style.display = 'none';
    document.getElementById('headCardInfo').classList.add('d-none');
    document.getElementById('viewPay').style.display = 'block';
    document.getElementById('viewNequi').classList.remove('d-none');
  });

  document.getElementById('btn-volver-nequi').addEventListener('click', () => {
    document.getElementById('selects').style.display = 'none';
    document.getElementById('formTercero').style.display = 'none';
    document.getElementById('viewNequi').classList.add('d-none');
    document.getElementById('formPay').style.display = 'block';
    document.getElementById('headCardInfo').classList.remove('d-none');
    document.getElementById('viewPay').style.display = 'block';

    if (!id_tercero) document.getElementById('btn-volver').style.display = 'block';
    else document.getElementById('btn-volver').style.display = 'none';
  });

  const nequi = document.querySelectorAll('.nequiPay');

  // Loop over them and prevent submission
  Array.from(nequi).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
        } else {
          event.preventDefault();
          if (document.getElementById('phoneNequi').value.length != 10) {
            document.getElementById('phoneNequi').classList.add('is-invalid');
            return Swal.fire({
              position: 'center',
              icon: 'warning',
              title: 'El número de telefono debe tener 10 digitos',
              showConfirmButton: false,
              timer: 2000,
            });
          } else document.getElementById('phoneNequi').classList.remove('is-invalid');

          //  logica de pago con tarjeta

          let dataNequi = {};
          form.querySelectorAll('input').forEach((input) => {
            if (input.id == 'phoneNequi') dataNequi.phone_number = input.value;
          });

          data.nequi = dataNequi;
          data.payment_method = 'NEQUI';
          data.id_tercero = data.id_tercero ? data.id_tercero : id_tercero;
          data.id_plan = data.id_plan ? data.id_plan : id_plan;
          data.id_sucursal = data.id_sucursal ? data.id_sucursal : id_sucursal;

          console.log(data);
        }
      },
      false,
    );
  });

  document.querySelector('.pseMetod').addEventListener('click', async () => {
    let Banks = await axios.get('https://secure.ilcolombia.com/api/pay/getInstitutionsFinancialPSE');

    Banks.data.data.forEach((bank) => {
      if (bank.financial_institution_code != '0') {
        let option = document.createElement('option');
        option.value = bank.financial_institution_code;
        option.text = bank.financial_institution_name;
        document.getElementById('bankPse').appendChild(option);
      }
    });

    document.getElementById('selects').style.display = 'none';
    document.getElementById('formTercero').style.display = 'none';
    document.getElementById('formPay').style.display = 'none';
    document.getElementById('btn-volver').style.display = 'none';
    document.getElementById('headCardInfo').classList.add('d-none');
    document.getElementById('viewPay').style.display = 'block';
    document.getElementById('viewPse').classList.remove('d-none');
  });

  document.getElementById('btn-volver-pse').addEventListener('click', () => {
    document.getElementById('selects').style.display = 'none';
    document.getElementById('formTercero').style.display = 'none';
    document.getElementById('viewPse').classList.add('d-none');
    document.getElementById('formPay').style.display = 'block';
    document.getElementById('headCardInfo').classList.remove('d-none');
    document.getElementById('viewPay').style.display = 'block';

    if (!id_tercero) document.getElementById('btn-volver').style.display = 'block';
    else document.getElementById('btn-volver').style.display = 'none';
  });

  const pse = document.querySelectorAll('.pseForm');

  // Loop over them and prevent submission
  Array.from(pse).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
        } else {
          event.preventDefault();
          if (document.getElementById('phonePse').value.length != 10) {
            document.getElementById('phonePse').classList.add('is-invalid');
            return Swal.fire({
              position: 'center',
              icon: 'warning',
              title: 'El número de telefono debe tener 10 digitos',
              showConfirmButton: false,
              timer: 2000,
            });
          } else document.getElementById('phonePse').classList.remove('is-invalid');

          //  logica de pago con tarjeta
        }

        let dataPse = {};

        form.querySelectorAll('input').forEach((input) => {
          if (input.id == 'nombrePse') dataPse.full_name = input.value;
          if (input.id == 'documentoPse') dataPse.user_legal_id = input.value;
          if (input.id == 'phonePse') dataPse.phone_number = input.value;
        });

        form.querySelectorAll('select').forEach((select) => {
          if (select.id == 'typeDocPse') dataPse.user_legal_id_type = select.value;
          if (select.id == 'typePersonPse') dataPse.user_type = select.value;
          if (select.id == 'bankPse') dataPse.financial_institution_code = select.value;
        });

        data.pse = dataPse;
        data.payment_method = 'PSE';
        data.id_tercero = data.id_tercero ? data.id_tercero : id_tercero;
        data.id_plan = data.id_plan ? data.id_plan : id_plan;
        data.id_sucursal = data.id_sucursal ? data.id_sucursal : id_sucursal;

        console.log(data);
      },
      false,
    );
  });
});

function detectarTipoTarjeta(numeroTarjeta) {
  const iin = numeroTarjeta.slice(0, 6);
  const visa = /^4[0-9]{5}$/;
  const masterCard = /^5[1-5][0-9]{4}$/;
  const americanExpress = /^3[47][0-9]{4}$/;
  const dinersClub = /^3(?:0[0-5]|[68][0-9])[0-9]{3}$/;
  const discover = /^6(?:011|5[0-9]{2})[0-9]{3}$/;
  const jcb = /^(?:2131|1800|35\d{3})$/;

  if (visa.test(iin)) {
    return 'Visa';
  } else if (masterCard.test(iin)) {
    return 'MasterCard';
  } else if (americanExpress.test(iin)) {
    return 'American Express';
  } else if (dinersClub.test(iin)) {
    return 'Diners Club';
  } else if (discover.test(iin)) {
    return 'Discover';
  } else if (jcb.test(iin)) {
    return 'JCB';
  } else {
    return 'Desconocido';
  }
}
