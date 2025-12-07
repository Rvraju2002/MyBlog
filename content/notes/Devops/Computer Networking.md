

1. Components
2. OSI Model
3. Classification
4. Devices
5. Home Network
6. IP Addresses
7. Protocols
8. DNS & DHCP
9. Network Commands

What is Computer Network?
 Communication between two or more network interfaces.

Components Of Computer Network

1. Two or more computers/Devices
2. Cables as links between the computers
3. A network interfacing card(NIC)on each
4. computer
5. Switches
6. Routers
7. Software called operating system (OS)

OSI MODEL

People around the world uses computer network to communicate with each other
for worldwide data communication, systems must be developed which are compatible to communicate with each other
There should be standard communication method & devices
ISO(International Oragnization ) has developed this standaard

1. Physcial







Classification of network by Geography

LAN --Local area network  -- Using Capble givingh network and Connecting printers
WAN -- Wide Area Network
MAN -Metropolitan area network
CAN- Campus Area network
PAN--Personal area network --bluetooth

UNDERSTAND IPV4 Address

192.168.100.1 --IP ADDRESS TOTAL 32bits 

192 --11000000
168 --10101000
100 --01100100
1 -00000001  

11111111 -- this binary number was 255 this was last octte 


Public and private IP Divison

EG: 54.86.23.90

Private IP=> For local network design
EG: 192.168.1.10

PRIVATE IP RANGES

CLASS A 10.0.0.0.0 - 10.255.255.255
CLASS B 172.16.0.0 - 172.31.255.255
CLASS C 192.168.0.0 - 192.168.255.255


## 1️⃣ Basic Rule: All IPv4 Addresses

- IPv4 address **always has 4 parts** (called _octets_).  
    Examples:
    
    - `10.0.0.1`
        
    - `192.168.0.10`
        
    - `172.16.5.100`
        
- Format:
    
    `x.x.x.x   → 4 numbers`
    
- Each part (octet) is from **0 to 255**.
    
- So **all** of these have 4 octets:
    
    - Class A
        
    - Class B
        
    - Class C
        
    - Any normal IPv4 address
        

✅ Conclusion:  
**“4 octets” is not special to Class A. Every IPv4 address has 4 octets.**

---

## 2️⃣ What’s Special About Class A?

Class A is special because of **how many octets are for Network vs Host** (in the **default** mask).

### Class A (default)

- **Default subnet mask**: `/8` → `255.0.0.0`
    
- This means:
    
    - **1st octet** = Network part (fixed for that network)
        
    - **Other 3 octets** = Host part (can change)
        

### Example Class A network

- Network: `10.0.0.0/8`
    
    - `10` = network part (fixed)
        
    - `0.0.0` → up to `255.255.255` = host part (variable)
        

So possible IP range in this network:

- From: `10.0.0.0`
    
- To: `10.255.255.255`
    

Now count host combinations:

- 2nd octet: `0–255` → 256 values
    
- 3rd octet: `0–255` → 256 values
    
- 4th octet: `0–255` → 256 values
    

Total possible addresses:

`256 × 256 × 256 = 256^3 = 16,777,216`

👉 That’s where the “16 million IPs in a Class A network” comes from.

✅ Summary:

- Still **4 octets** like every IPv4.
    
- But for Class A **default**:
    
    - 1 octet = Network
        
    - 3 octets = Host → `256^3 = 16,777,216` IPs
        

---

## 3️⃣ Quick Comparison: Class A vs B vs C (Default Masks)

Think in terms of:

- **Network octets** (fixed for the network)
    
- **Host octets** (used for host addresses)
    

### Class A — `/8` → `255.0.0.0`

`[ 1st = Network ] [ 2nd = Host   ] [ 3rd = Host   ] [ 4th = Host   ] Host octets = 3 → 256^3 = 16,777,216 IPs`

---

### Class B — `/16` → `255.255.0.0`

`[ 1st = Network ] [ 2nd = Network ] [ 3rd = Host    ] [ 4th = Host    ] Host octets = 2 → 256^2 = 65,536 IPs`

---

### Class C — `/24` → `255.255.255.0`

`[ 1st = Network ] [ 2nd = Network ] [ 3rd = Network ] [ 4th = Host    ] Host octets = 1 → 256 IPs`

---

## 4️⃣ About Your Line: “class a 4 correct”

- ✅ Yes: **there are always 4 parts** in the IP (for Class A, B, C… all IPv4).
    
- But in **Class A default**, only the **1st octet** is network; the **other 3** are host, which is why it has so many IPs.
    

---

If you want, next step we can do that exercise you mentioned:  
You send something like `11.5.6.7` or `172.20.5.9` and I’ll reply with:

- Class (A/B/C)
    
- Default subnet mask
    
- How many hosts possible in that default network.

![[protocals.jpeg]]

![[layers.jpeg]]

![[address.jpeg]]

![[iprange.jpeg]]


conatiners: 
“On a single VM running Docker, each container has its **own root filesystem**, so inside the container you see your own `/etc`, `/var`, `/usr`, etc. That means two services running in two containers each have their **own `/etc`** for configuration, isolated from each other and from the host’s `/etc`.”


docker run -- its used to create continer

sudo docker run hello-world  -- hello world it was image
systemctl docker status

docker images
docker ps ---it show available container
docker ps -a it show available conatainer

docker run --name web01 -d -p 9080:80 ngnix
docker build -t testimage .   --- docker build create image from a docker file - t tag the name called testimage  find dot(.) represents current directory

docker run -d -P testimage -- port take automatically if capital if small we need to give
docker stop web01  -- stop services
docker rm web01  -- deleet container
docker ps -- get image id
docker rmi imageid --delete images


monolithic

The entire application, sub services Everything in just one single application and its like an elepahant

    USER INTERFACE
          |
  chat  -- javaapp  -- Post
          |
      notification
**Microservices**


Chat --python
post --nodejs            --- API GATEWAY
notification --java

Using microservoces we can use mutiple language for difference function but when we host each language need each services so we use docker for containersation(They are independent)


Monolithic is nothing only single code base it any issue it affect entire application not modules if high traffic need to increase pods for entire

**

Monolithic vs Microservices is basically “all-in-one box” vs “many small boxes”.  
Let’s do it step by step with a simple product example (like an e-commerce app) and then map to real tech terms.

---

## 1. Monolithic Architecture

### Simple idea

Everything is built and deployed as a single application (one codebase, one build, one deployment).

Think of:

One big restaurant where the same building has: kitchen + billing counter + online orders + delivery management + feedback system.  
If you want to renovate one small part (only delivery desk), you still affect the whole building.

### Example: E-commerce Monolith

Imagine an app called ShopAll built as one Java Spring Boot / Node.js app with:

- User Module (login, signup)  
      
    
- Product Module (list products, search)  
      
    
- Order Module (cart, checkout)  
      
    
- Payment Module  
      
    
- Notification Module (email, SMS)  
      
    

All of this is:

- in one repository  
      
    
- packaged as one WAR/JAR or one Docker image  
      
    
- deployed as one service (e.g. shopall-app on a VM or one container replica)  
      
    

If traffic increases, you scale like this:

+--------------------+

|  shopall-app (v1)  |

+--------------------+

  

Scale:

3 replicas of the same app behind a load balancer

  

You cannot scale only “Product service” or only “Payments”. You scale the entire app.

### Pros of Monolith

- ✅ Simple to start with – easy for small teams, POCs, MVP.  
      
    
- ✅ Simple deployment – one build, one deployment pipeline.  
      
    
- ✅ Easy local setup – run one app, one DB.  
      
    
- ✅ Less network overhead – internal function calls, not HTTP between services.  
      
    

### Cons of Monolith

- ❌ Becomes huge over time (tight coupling, “big ball of mud”).  
      
    
- ❌ Hard to understand for new developers.  
      
    
- ❌ One small change → redeploy the whole app.  
      
    
- ❌ Scaling is coarse – you can’t scale only heavy modules (like search or report).  
      
    
- ❌ Tech lock-in – very hard to use different languages/tech for different parts.  
      
    

---

## 2. Microservices Architecture

### Simple idea

The application is broken into many small, independent services. Each service:

- does one main business capability  
      
    
- has its own codebase  
      
    
- can have its own database  
      
    
- is deployed independently  
      
    

Think of:

A food street with many small shops: one only for briyani, one only for juice, one only for desserts.  
Each shop can hire its own staff, open/close anytime, and expand independently.

### Example: E-commerce as Microservices

Same ShopAll app split as:

1. User Service  
      
    

- /users/register  
      
    
- /users/login  
      
    

3. Product Service  
      
    

- /products  
      
    
- /products/{id}  
      
    

5. Order Service  
      
    

- /orders  
      
    
- /orders/{id}  
      
    

7. Payment Service  
      
    

- /payments  
      
    
- /payments/status  
      
    

9. Notification Service  
      
    

- /send-email  
      
    
- /send-sms  
      
    

Now, an order flow looks like:

1. Frontend calls User Service → validate user.  
      
    
2. Calls Product Service → get product and price.  
      
    
3. Calls Order Service → creates order.  
      
    
4. Order Service calls Payment Service → do payment.  
      
    
5. Payment Service calls Notification Service → send email/SMS.  
      
    

Each of these is a separate deployable service, usually its own Docker container:

+-----------------+      +------------------+

|  user-service   |      | product-service |

+-----------------+      +------------------+

  

+-----------------+      +--------------------+

| order-service   |      | payment-service   |

+-----------------+      +--------------------+

  

+-----------------+

| notification    |

+-----------------+

  

They talk via:

- HTTP/REST  
      
    
- gRPC  
      
    
- Message broker (RabbitMQ, Kafka, etc.)  
      
    

You can scale only what is needed:

- Product search getting more load? → scale product-service to 5 replicas.  
      
    
- Payment heavy on weekends? → scale payment-service.  
      
    

### Pros of Microservices

- ✅ Independent deployment – change in one service doesn’t require deploying all.  
      
    
- ✅ Better scalability – scale per service.  
      
    
- ✅ Tech freedom – one service in Node.js, another in Java, another in Go.  
      
    
- ✅ Better separation of concerns – teams own specific services.  
      
    
- ✅ Fault isolation – payment crash won’t fully kill product listing (if designed with fallbacks).  
      
    

### Cons of Microservices

- ❌ More complex to design and manage.  
      
    
- ❌ Requires strong DevOps (Docker, Kubernetes, CI/CD, monitoring).  
      
    
- ❌ Network issues, API versioning, distributed transactions.  
      
    
- ❌ More difficult debugging (one request passes through many services).  
      
    
- ❌ Data consistency is tricky (each service often has its own DB).  
      
    

---

## 3. When to Use What?

### Monolith – good when:

- Project is small/medium.  
      
    
- Team is small (1–10 devs).  
      
    
- You are early stage (startup, MVP, POC).  
      
    
- You want speed of development more than perfect architecture.  
      
    

### Microservices – good when:

- System is large and growing.  
      
    
- Multiple teams (backend team per domain).  
      
    
- You need high scalability and high availability.  
      
    
- Different modules need different tech stacks.  
      
    
- You’re okay to invest in DevOps, monitoring, logging, tracing.  
      
    

---

## 4. One More Example in Testing Point of View (for you as Automation Tester)

### Monolithic testing

- You usually have one big backend URL (e.g. https://api.shopall.com).  
      
    
- For automation:  
      
    

- UI tests: Playwright/Cypress point to one app.  
      
    
- API tests: All endpoints in one Postman collection / RestAssured project.  
      
    

- Integration and E2E tests are simpler because everything is in one app.  
      
    

### Microservices testing

- You have many base URLs:  
      
    

- https://user.shopall.com  
      
    
- https://orders.shopall.com  
      
    
- https://products.shopall.com  
      
    

- For automation:  
      
    

- You may need separate test suites per service.  
      
    
- Contract testing (e.g. Pact) to ensure services agree on request/response.  
      
    
- More mocking/stubbing of dependent services.  
      
    
- End-to-end tests go through API gateway or frontend and cover multiple services.  
      
    

---

## 5. Short One-Line Difference

- Monolithic:  
    One big application where all modules are tightly packed and deployed together.  
      
    
- Microservices:  
    Many small, independent services, each handling a specific business function, communicating over the network.  
      
    

---

If you want, next I can:

- help you write simple interview-style answers for “What is monolithic vs microservices?”  
      
    
- or create a small diagram + sample APIs that you could mention in SDET interviews.  
      
    

  
![[WhatsApp Image 2025-12-01 at 21.39.24.jpeg


docker system prune -a
docker down