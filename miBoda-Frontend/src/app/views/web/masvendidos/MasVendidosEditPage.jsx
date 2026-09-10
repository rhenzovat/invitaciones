import React, { useEffect, useState, useRef, } from "react";
import { useIntl } from "react-intl";
import { styled, } from "@mui/material/styles";
import { SimpleCard, } from "app/components";
import TextArea from 'devextreme-react/text-area';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Avatar } from "@files-ui/react";
import Badge from "@mui/material/Badge";
import { TextBox } from 'devextreme-react/text-box';
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FieldsetHeader from '../../../components/FieldsetHeader/FieldsetHeader';
import { authJWTConfig } from "app/authJWTConfig";
export const DomainBackend = authJWTConfig.domain + "/";

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const MasVendidosEditPage = props => {

  const intl = useIntl();
  const textRef_titulo = useRef(null);
  const textRef_descripcion = useRef(null);
  const textRef_precio = useRef(null);

  const [sliderTitulo, setSliderTitulo] = useState(null);
  const [sliderDescripcion, setSliderDescripcion] = useState(null);
  const [sliderPrecio, setSliderPrecio] = useState(null);

  const [imagenProfile, setImagenProfile] = useState(null);
  const [datosState, setDatosState] = useState({ titulo: '', descripcion: '', precio: '' });

  function grabar() {

    const params = {
      id_mas_vendido: props.dataRowEditNew.id_mas_vendido, //TextArea
      titulo: textRef_titulo.current.instance.option('value'),
      descripcion: textRef_descripcion.current.instance.option('value'),
      precio: textRef_precio.current.instance.option('value'),

      urlFileTem: imagenProfile,
      Activo: 'S',
    }
    props.actualizarVendido(params);
  }
  useEffect(() => {
    if (props.dataRowEditNew)
      setDatosState(props.dataRowEditNew)
  }, [props.dataRowEditNew])

  return (
    <>
      <ContentBox className="analytics">
        <SimpleCard>
          <FieldsetHeader title={`Más Vendido : ${props.dataRowEditNew.id_mas_vendido}`}>

            {/* PROFILE PHOTO */}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <PhotoCameraIcon
                  sx={{
                    border: "5px solid white",
                    backgroundColor: "#ff558f",
                    borderRadius: "50%",
                    padding: ".2rem",
                    width: 35,
                    height: 35
                  }}
                ></PhotoCameraIcon>
              }
            >
              <Avatar src={imagenProfile ? imagenProfile : props.dataRowEditNew.url_imagen ? DomainBackend + props.dataRowEditNew.url_imagen : `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`} alt="Avatar" onChange={(e) => { setImagenProfile(e) }} />
            </Badge>

            <TextArea
              id="txtArea_titulo"
              className="mt-3"
              height={80}
              ref={textRef_titulo}
              value={sliderTitulo ? sliderTitulo : datosState.titulo}
              autoResizeEnabled={false}
              placeholder="Type..."
              label="Título"
              stylingMode={'filled'}
              labelMode={'floating'}
              showClearButton={true}
              onValueChanged={(e) => { e.value ? setSliderTitulo(e.value) : setSliderTitulo(null), setDatosState({ titulo: '' }) }}
            />

            <TextArea
              id="txtArea_descripcion"
              className="mt-3"
              height={80}
              ref={textRef_descripcion}
              value={sliderDescripcion ? sliderDescripcion : datosState.descripcion}
              autoResizeEnabled={false}
              placeholder="Type..."
              label="Descripción"
              stylingMode={'filled'}
              labelMode={'floating'}
              showClearButton={true}
              onValueChanged={(e) => { e.value ? setSliderDescripcion(e.value) : setSliderDescripcion(null), setDatosState({ descripcion: '' }) }}
            />

            <TextBox
              className="mt-4 mb-3"
              id="txt_precio"
              ref={textRef_precio}
              value={sliderPrecio ? sliderPrecio : datosState.descripcion}
              placeholder="Type..."
              label="Precio"
              stylingMode={'filled'}
              labelMode={'floating'}
              showClearButton={true}
              onValueChanged={(e) => { e.value ? setSliderPrecio(e.value) : setSliderPrecio(null), setDatosState({ precio: '' }) }}
            />

            <Button
              className="mt-3 bg-danger text-white"
              variant="outlined"
              // visible={accessButton.crear ? true : false}
              onClick={grabar}
              startIcon={<DeleteIcon />}>
              Grabar
            </Button>
          </FieldsetHeader >
        </SimpleCard>
      </ContentBox>
    </>
  );
}

export default MasVendidosEditPage;

