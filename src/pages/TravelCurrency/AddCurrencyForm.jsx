import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button, Form, Input, Select, Switch } from 'antd';

const { Option } = Select;

const AddCurrencyForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); 
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const payload = {
      code: values.code,
      currencyName: values.currencyName,
      symbol: values.symbol,
      localSymbol: values.localSymbol,
      precision: Number(values.precision),
      currency: values.currency,
      status: values.status,
    };

    const token = localStorage.getItem("authToken"); 
    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    setLoading(true);
    try {
      const url = "/v1/tyltravelcurrency/add/travel-currency";
      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj",
          "Authorization": `Bearer ${token}`,
        },
      });

      toast.success("Currency Created Successfully!");
      navigate("/currency-table");
    } catch (error) {
      console.error("Error while creating currency:", error);
      toast.error("Failed to Create Currency. Please Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add New Currency</h2>
      <Form layout="vertical" form={form} onFinish={onFinish} initialValues={{ status: true }}>
        <Form.Item label="Currency Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Currency Name" name="currencyName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Symbol" name="symbol">
          <Input />
        </Form.Item>
        <Form.Item label="Local Symbol" name="localSymbol">
          <Input />
        </Form.Item>
        <Form.Item label="Precision" name="precision" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Currency" name="currency" rules={[{ required: true }]}>
          <Select>
            <Option value="USD">USD</Option>
            <Option value="INR">INR</Option>
            <Option value="EUR">EUR</Option>
            <Option value="CNY">CNY</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Status" name="status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
        <div className="flex gap-4 mt-4">
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
          <Button onClick={() => navigate("/currency-table")}>Cancel</Button>
        </div>
      </Form>
    </div>
  );
};

export default AddCurrencyForm;

