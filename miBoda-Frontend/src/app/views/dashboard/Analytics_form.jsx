
import React, { useState, Fragment } from 'react';
import { styled, useTheme } from "@mui/material/styles";
import 'devextreme/data/odata/store';
import './profile.scss';
import Form from 'devextreme-react/form';

const Title = styled("span")(() => ({
  fontSize: "1rem",
  fontWeight: "500",
  marginRight: ".5rem",
  textTransform: "capitalize"
}));

const SubTitle = styled("span")(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary
}));

const H4 = styled("h4")(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "500",
  marginBottom: "1rem",
  textTransform: "capitalize",
  color: theme.palette.text.secondary
}));

export default function Analytics() {
  const [notes, setNotes] = useState(
    'Sandra is a CPA and has been our controller since 2008. She loves to interact with staff so if you`ve not met her, be certain to say hi.\r\n\r\nSandra has 2 daughters both of whom are accomplished gymnasts.'
  );
  const employee = {
    ID: 7,
    FirstName: 'Sandra',
    LastName: 'Johnson',
    Prefix: 'Mrs.',
    Position: 'Controller',
    Picture: 'images/employees/06.png',
    BirthDate: new Date('1974/11/5'),
    HireDate: new Date('2005/05/11'),
    Notes: notes,
    Address: '4600 N Virginia Rd.'
  };


  return (
    <Fragment>
      <ContentBox className="analytics">

        <h2 className={'content-block'}>Profile</h2>

        <div className={'content-block dx-card responsive-paddings'}>
          <div className={'form-avatar'}>
            <img
              alt={''}
              src={`https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/${employee.Picture
                }`}
            />
          </div>
          <span>{notes}</span>
        </div>

        <div className={'content-block dx-card responsive-paddings'}>
          <Form
            id={'form'}
            defaultFormData={employee}
            onFieldDataChanged={e => e.dataField === 'Notes' && setNotes(e.value)}
            labelLocation={'top'}
            colCountByScreen={colCountByScreen}
          />
        </div>


      </div>
    </Fragment >
  );
}

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
};

const dataSource = {
  store: {
    version: 2,
    type: 'odata',
    key: 'Task_ID',
    url: 'https://js.devexpress.com/Demos/DevAV/odata/Tasks'
  },
  expand: 'ResponsibleEmployee',
  select: [
    'Task_ID',
    'Task_Subject',
    'Task_Start_Date',
    'Task_Due_Date',
    'Task_Status',
    'Task_Priority',
    'Task_Completion',
    'ResponsibleEmployee/Employee_Full_Name'
  ]
};

const priorities = [
  { name: 'High', value: 4 },
  { name: 'Urgent', value: 3 },
  { name: 'Normal', value: 2 },
  { name: 'Low', value: 1 }
];
