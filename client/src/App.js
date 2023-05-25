import logo from './TM_Logo_Primary_2c_300x64.png';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import  { Container, Row, Col, Form, Button, ProgressBar, Alert } from "react-bootstrap"
import axiosInstance from './utils/axios';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState();
  const [error, setError] = useState();
  const [success, setSuccess] = useState();
  const submitHandler = (e) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    let formData = new FormData();
    formData.append("file",selectedFiles[0]);
    axiosInstance.post("/upload_file",formData,{
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: data => {
        let perNum = Math.round(100*(data.loaded/data.total));
        setProgress(perNum);
        if(perNum==100){
          setSuccess("Scanning started .....");
        }
      }
    }).then(response => {
      setSuccess("File uploaded and scanned successfuly!!!");
    }).catch(error=>{
      setSuccess(undefined);
      const code = error?.response?.data?.code;
      switch(code){
        case "FILE_MISSING":
          setError("Please select a file before uploading");
          break;
        case "LIMIT_FILE_SIZE":
          setError("File size exceded the limit set for 10 MB.");
          break;
        case "FILE_MALICIOUS":
          setError("File is malicious. Please upload clean file.");
          break;
        default:
          setError("Sorry, something went wrong!!!");
          break;
      }
    });
  }
  return <Container>
        <Row><Col lg={{span:6, offset:3}}>
            <h1>&nbsp;</h1>
    </Col>
    </Row>
    <Row><Col lg={{span:6, offset:3}}>
        <img src={logo} className="App-logo" alt="logo" />       
    </Col>
    </Row>
    <Row><Col lg={{span:6, offset:3}}>
            <h1>&nbsp;</h1>
            <h3>File Storage Security Demo</h3><br/>
    </Col>
    </Row>
    <Row>
      <Col lg={{span:6, offset:3}}>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select File and click Upload to scan</Form.Label>
            <Form.Control 
              type="file" 
              onChange={(e)=>setSelectedFiles(e.target.files)}/>
          </Form.Group>
          <Form.Group>
            <Button variant="primary" type="submit">
              Upload
            </Button><br/><br/>
          </Form.Group>
          {error && <Alert variant = "danger">
            Error Message {error}
          </Alert> }
          {success && <Alert variant = "success">
            {success}
          </Alert> }
          { !error && progress && <ProgressBar now={progress} label={`${progress}%`} /> }
        </Form>
        </Col>
    </Row>
    <Row>
    <Col lg={{span:6, offset:3}}>
    <br/><br/>
      Developed by Satish Vagadia - Trend Micro</Col>
    </Row>
  </Container>;
}

export default App;
