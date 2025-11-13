import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, Form, Button, Alert, Spinner, Card,
  Row, Col, Table, Tab, Tabs, Badge
} from 'react-bootstrap';

const CustomerLedger = () => {
  const [formData, setFormData] = useState({
    username: 'administrator',
    userpassword: 'admin',
    Menuid: '01',
    number: '1'
  });

  const [response, setResponse] = useState({
    data: null,
    loading: false,
    error: null,
    timeTaken: null
  });

  const [activeTab, setActiveTab] = useState('json');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse({
      data: null,
      loading: true,
      error: null,
      timeTaken: null
    });

    const startTime = performance.now();

    try {
      const { data } = await axios.post('http://localhost:8081/api/get-ledger', {
        username: formData.username,
        password: formData.userpassword,
        Menuid: formData.Menuid,
        number: formData.number
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      // Handle XML response if present
      let processedData = data.data;
      if (typeof data.data === 'string' && data.data.startsWith('<')) {
        // If the response is XML, we'll display it as text
        processedData = { xml: data.data };
      }

      setResponse({
        data: processedData,
        loading: false,
        error: null,
        timeTaken: ((performance.now() - startTime) / 1000).toFixed(2) + 's'
      });

    } catch (error) {
      setResponse({
        data: null,
        loading: false,
        error: error.response?.data?.error || 
              error.response?.data?.message || 
              error.message || 
              'Failed to fetch data',
        timeTaken: ((performance.now() - startTime) / 1000).toFixed(2) + 's'
      });
    }
  };

  const renderTableData = () => {
    if (!response.data) return null;

    // Handle XML response
    if (response.data.xml) {
      return (
        <div className="mt-3 p-2 border rounded bg-light">
          <h5>XML Response</h5>
          <pre style={{ maxHeight: '500px', overflow: 'auto' }}>
            {response.data.xml}
          </pre>
        </div>
      );
    }

    // Handle JSON response
    let tables = [];
    if (response.data.NewDataSet && response.data.NewDataSet.Table) {
      tables = Array.isArray(response.data.NewDataSet.Table) ? 
               response.data.NewDataSet.Table : 
               [response.data.NewDataSet.Table];
    } else if (response.data.Table) {
      tables = Array.isArray(response.data.Table) ? 
               response.data.Table : 
               [response.data.Table];
    } else if (response.data.row) {
      tables = [{
        row: Array.isArray(response.data.row) ? 
             response.data.row : 
             [response.data.row]
      }];
    } else if (Array.isArray(response.data)) {
      tables = response.data;
    }

    if (tables.length === 0) {
      return <Alert variant="info">No table data found in response</Alert>;
    }

    return tables.map((table, tableIndex) => {
      const rows = table.row ? 
                  (Array.isArray(table.row) ? table.row : [table.row]) : 
                  [];

      if (rows.length === 0) {
        return (
          <Alert key={`table-${tableIndex}`} variant="warning">
            Table {tableIndex + 1} has no rows
          </Alert>
        );
      }

      const columns = rows[0] ? Object.keys(rows[0]) : [];

      return (
        <div key={`table-${tableIndex}`} className="mb-4">
          <h5>
            Table {tableIndex + 1}
            <Badge bg="info" className="ms-2">
              {rows.length} {rows.length === 1 ? 'row' : 'rows'}
            </Badge>
          </h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {columns.map(col => (
                      <td key={`${rowIndex}-${col}`}>
                        {row[col] === null ? 'null' : 
                         typeof row[col] === 'object' ? JSON.stringify(row[col]) : 
                         String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      );
    });
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Customer Ledger</h3>
                {response.timeTaken && (
                  <Badge bg="light" text="dark" pill>
                    {response.timeTaken}
                  </Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="userpassword"
                        value={formData.userpassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Menu ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="Menuid"
                        value={formData.Menuid}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="text-center mt-3">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={response.loading}
                    className="px-4"
                  >
                    {response.loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Loading...
                      </>
                    ) : (
                      'Fetch Ledger Data'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {response.error && (
            <Alert variant="danger" className="mt-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {response.error}
            </Alert>
          )}

          {response.data && (
            <Card className="mt-4 shadow">
              <Card.Header className="bg-secondary text-white">
                <h4 className="mb-0">Results</h4>
              </Card.Header>
              <Card.Body>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-3"
                >
                  <Tab eventKey="json" title="JSON View">
                    <div className="mt-3 p-2 border rounded bg-light">
                      <pre className="mb-0" style={{ maxHeight: '500px', overflow: 'auto' }}>
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  </Tab>
                  <Tab eventKey="table" title="Table View">
                    <div className="mt-3">
                      {renderTableData()}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerLedger;