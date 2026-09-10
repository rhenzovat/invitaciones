import { makeStyles } from '@mui/styles';

//0ABB87
export const useStylesEncabezado = makeStyles(theme => ({
  toolbar: {
    fontSize: "14px !important",
    minHeight: "10px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",

    fontWeight: "500",
    minHeight: "30px !important",
    letterSpacing: "0.75px !important",
  },

  titleWhite: {
    color: "#ffffff !important",
    fontSize: "12px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",
    marginBottom: "5px !important",
    marginTop: "5px !important",
  },
  titleBlack: {
    color: "#000000 !important",
    fontSize: "12px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",
    marginBottom: "5px !important",
    marginTop: "5px !important",
  },
  title: {
    color: "#ffffff !important",
    fontSize: "12px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",
    // marginBottom: "5px !important",
    // marginTop: "5px !important",
  },
  principal: {
    color: "black !important",
    backgroundColor: "#646464 !important",//000000
    alignItems: "center !important",
    borderRadius: "2px 4px 4px 4px !important",
    fontSize: "13px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",
    backgroundSize: "cover",
    color: "white !important"
  },

  secundario: {
    // backgroundColor: "#000000 !important",
    borderRadius: "2px 3.5px 3.5px 3.5px !important",
    fontSize: "11px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",
    minWidth: "10px !important",
    //color: "#ffffff !important",
    color: "white !important",
    // textTransform: "uppercase !important",
    boxShadow: "0px 0px 0px -1px rgba(0,0,0,0.1), 1px 1px 1px -1px rgba(0, 0, 0, 0), 0px 1px 0px 0px rgba(0,0,0,0.11) !important",

    // backgroundSize: 'cover',
  },

  secundarioObjetoEdit: {
    borderRadius: "2px 3.5px 3.5px 3.5px !important",
    fontSize: "11px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",
    minWidth: "10px !important",
    // textTransform: "uppercase !important",
    boxShadow: "0px 0px 0px -1px rgba(0,0,0,0.1), 1px 1px 1px -1px rgba(0, 0, 0, 0), 0px 1px 0px 0px rgba(0,0,0,0.11) !important",
  },
  titleObjetoEdit: {
    color: "black !important",
    fontSize: "14px !important",
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif !important",
    margin: "5px !important",

  },

  border: {
    borderRadius: "2px 4px 4px 4px !important",
    //border: "0.5px solid #000000"
    border: "0.1px solid #ffffff00 !important"
  },
  ocultar: {
    display: "none"
  },


}));

export const useStylesTab = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',

  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    minHeight: '15px!important',

  },
  TabPanel: {
    order: 0,
    flex: '1 3 50%',

  },
  tabContent: {
    '&.Mui-selected': {
      color: '#000000',//'#168342',//
      backgroundColor: '#168342'//'#F1F2F6'//'#F5F6FA'
    },
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif",
    fontSize: "10px",
    minHeight: theme.spacing(6.5),
  },
  avatar: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    border: "1px solid #ebedf2",
  },
  avatarContent: {
    '&.Mui-selected': {
      color: '#000000',
      backgroundColor: '#168342'  //'#000000'//'#F1F2F6'//'#F5F6FA',
    },
    fontFamily: "'Helvetica Neue', 'Segoe UI', Helvetica, Verdana, sans-serif",
    fontSize: "10px",
    minHeight: theme.spacing(9),

  },
  avatarSmall: {
    width: "30px!important",
    height: "30px!important",
    border: "1.2px solid #000000"
  },
  avatarMedium: {
    width: "100px!important",
    height: "100px!important",
    border: "1.2px solid #000000"
  },
  avatarLarge: {
    width: "280px!important",
    height: "280px!important",
    border: "1.2px solid #000000"
  },
  avatarPopup: {
    width: "480px!important",
    height: "480px!important",
    border: "1.2px solid #000000"
  },

  cardLarge: {
    width: "280px!important",
    height: "280px!important",
  },
  cardPopup: {
    width: "480px!important",
    height: "480px!important",
  },

  container_ul_li: {
    display: "inline-block",
    width: "160px",
    margin: "10px"
  },

  lblColor: {
    color: '#000000',
    backgroundColor: '#F2F2F2'
  }

}));


